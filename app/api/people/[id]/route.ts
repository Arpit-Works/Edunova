
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/app/lib/mongodb";
import {
  updatePersonSchema,
  type PersonInput,
} from "@/app/lib/validations/people";

export const runtime = "nodejs";

type RouteContext = {
  params: { id: string };
};

function isValidId(id: string) {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json(
        { message: "Invalid person ID" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const person = await db
      .collection<PersonInput>("people")
      .findOne({ _id: new ObjectId(params.id) });

    if (!person) {
      return NextResponse.json(
        { message: "Person not found" },
        { status: 404 }
      );
    }

    const { _id, ...data } = person;

    return NextResponse.json({
      data: { ...data, id: _id.toString() },
    });
  } catch (error) {
    console.error("GET /api/people/:id failed:", error);

    return NextResponse.json(
      { message: "Failed to fetch person" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json(
        { message: "Invalid person ID" },
        { status: 400 }
      );
    }

    const body: unknown = await request.json();
    const result = updatePersonSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Invalid update data",
          errors: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const db = await getDb();
    const people = db.collection<PersonInput>("people");
    const id = new ObjectId(params.id);
    const updates = result.data;

    if (updates.email) {
      const duplicate = await people.findOne({
        email: updates.email,
        _id: { $ne: id },
      });

      if (duplicate) {
        return NextResponse.json(
          { message: "A person with this email already exists" },
          { status: 409 }
        );
      }
    }

    const updated = await people.findOneAndUpdate(
      { _id: id },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!updated) {
      return NextResponse.json(
        { message: "Person not found" },
        { status: 404 }
      );
    }

    const { _id, ...data } = updated;

    return NextResponse.json({
      data: { ...data, id: _id.toString() },
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    console.error("PATCH /api/people/:id failed:", error);

    return NextResponse.json(
      { message: "Failed to update person" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json(
        { message: "Invalid person ID" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db
      .collection<PersonInput>("people")
      .deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Person not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Person deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/people/:id failed:", error);

    return NextResponse.json(
      { message: "Failed to delete person" },
      { status: 500 }
    );
  }
}
