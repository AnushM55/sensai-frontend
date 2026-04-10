import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface TestCaseInput {
  id: string;
  stdin?: string;
  expected_output?: string;
}

interface EvaluateRequestBody {
  source_code: string;
  language_id: number;
  test_cases: TestCaseInput[];
  cpu_time_limit?: number;
  wall_time_limit?: number;
  memory_limit?: number;
  compiler_options?: string;
  command_line_arguments?: string;
}

const JUDGE0_FIELDS = 'status_id,stdout,stderr,compile_output,message,time';

const decodeBase64Field = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  try {
    return Buffer.from(value, 'base64').toString('utf-8');
  } catch {
    return value;
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const pollSubmission = async (token: string, maxAttempts = 15) => {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await fetch(
      `${process.env.JUDGE0_API_URL}/submissions/${token}?base64_encoded=true&fields=${JUDGE0_FIELDS}`,
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Judge0 status error: ${response.status} ${errorText}`);
    }

    const payload = await response.json();

    if (payload.status_id >= 3) {
      return {
        ...payload,
        stdout: decodeBase64Field(payload.stdout),
        stderr: decodeBase64Field(payload.stderr),
        compile_output: decodeBase64Field(payload.compile_output),
        message: decodeBase64Field(payload.message),
      };
    }

    await sleep(700);
  }

  throw new Error(`Timed out while waiting for Judge0 token ${token}`);
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as EvaluateRequestBody;

  if (!body?.source_code || !body?.language_id || !Array.isArray(body?.test_cases)) {
    return NextResponse.json(
      { error: 'source_code, language_id and test_cases are required' },
      { status: 400 },
    );
  }

  const results = [] as Array<{
    test_case_id: string;
    status_id: number;
    passed: boolean;
    stdin: string;
    expected_output: string;
    actual_output: string;
    stderr: string;
    compile_output: string;
    message: string;
    time: string;
  }>;

  for (const testCase of body.test_cases) {
    const submissionPayload = {
      source_code: body.source_code,
      language_id: body.language_id,
      stdin: testCase.stdin || '',
      expected_output: testCase.expected_output || null,
      cpu_time_limit: body.cpu_time_limit ?? 2,
      wall_time_limit: body.wall_time_limit ?? 5,
      memory_limit: body.memory_limit ?? 128000,
      compiler_options: body.compiler_options || '',
      command_line_arguments: body.command_line_arguments || '',
    };

    const createResponse = await fetch(`${process.env.JUDGE0_API_URL}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionPayload),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      return NextResponse.json(
        {
          error: `Judge0 submit error: ${createResponse.status} ${errorText}`,
          test_case_id: testCase.id,
        },
        { status: createResponse.status },
      );
    }

    const submission = await createResponse.json();
    const result = await pollSubmission(submission.token);

    const actualOutput = (result.stdout || '').trim();
    const expectedOutput = (testCase.expected_output || '').trim();

    const passed =
      result.status_id === 3
      && (!expectedOutput || actualOutput === expectedOutput);

    results.push({
      test_case_id: testCase.id,
      status_id: result.status_id,
      passed,
      stdin: testCase.stdin || '',
      expected_output: expectedOutput,
      actual_output: actualOutput,
      stderr: result.stderr || '',
      compile_output: result.compile_output || '',
      message: result.message || '',
      time: result.time || '',
    });
  }

  const failingCases = results.filter((result) => !result.passed);

  return NextResponse.json({
    total: results.length,
    passed: results.length - failingCases.length,
    failed: failingCases.length,
    results,
    failing_cases: failingCases,
    evidence: failingCases.map((testCase) => ({
      type: 'test_case',
      reference: testCase.test_case_id,
      description: `Expected "${testCase.expected_output}" but got "${testCase.actual_output}"`,
      stdin: testCase.stdin,
      expected_output: testCase.expected_output,
      actual_output: testCase.actual_output,
      stderr: testCase.stderr,
      compile_output: testCase.compile_output,
      message: testCase.message,
    })),
  });
}
