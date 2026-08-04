import bcrypt from "bcrypt";

export async function GET() {
  const hash = await bcrypt.hash("123", 10);

  return Response.json({
    hashedPassword: hash
  });
}