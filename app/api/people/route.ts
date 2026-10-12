
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";
import { personSchema } from "@/app/lib/validations/people";
import type { PersonInput } from "@/app/lib/validations/people";
import { MongoServerError } from "mongodb";

export const runtime = "nodejs";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const params = request.nextUrl.searchParams;

    const search = params.get("search")?.trim() ?? "";
    const role = params.get("role");
    const team = params.get("team");

    const filter: Record<string, unknown> = {};

    if (search) {
      const pattern = {
        $regex: escapeRegex(search),
        $options: "i",
      };

      filter.$or = [
        { name: pattern },
        { username: pattern },
        { email: pattern },
      ];
    }

    if (role) filter.role = role;
    if (team) filter.teams = team;

    const people = await db
      .collection<PersonInput>("people")
      .find(filter)
      .sort({ name: 1 })
      .toArray();

    return NextResponse.json({
      data: people.map(({ _id, ...person }) => ({
        ...person,
        id: _id.toString(),
      })),
      total: people.length,
    });
  } catch (error) {
    console.error("GET /api/people failed:", error);

    return NextResponse.json(
      { message: "Failed to fetch people" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const result = personSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Invalid person data",
          errors: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const db = await getDb();
    const people = db.collection<PersonInput>("people");

    const person = result.data;
    const existing = await people.findOne({
      email: person.email,
    });

    if (existing) {
      return NextResponse.json(
        { message: "A person with this email already exists" },
        { status: 409 }
      );
    }

    const created = {
      ...person,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const resultInsert = await people.insertOne(created);

    return NextResponse.json(
      {
        data: {
          ...created,
          id: resultInsert.insertedId.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    if (
      error instanceof MongoServerError &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { message: "A person with this email already exists" },
        { status: 409 }
      );
    }

    console.error("POST /api/people failed:", error);

    return NextResponse.json(
      { message: "Failed to create person" },
      { status: 500 }
    );
  }
}
