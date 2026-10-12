import type { Person, PersonInput } from "@/types/person";

const BASE_URL = "/api/people";

export type GetPeopleParams = {
  search?: string;
  role?: string;
  team?: string;
};

function messageFromText(text: string, status: number) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (!compact) return `Request failed (${status})`;
  return compact.length > 200 ? `${compact.slice(0, 200)}…` : compact;
}

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  if (!isJson) {
    const text = await response.text();
    throw new Error(messageFromText(text, response.status));
  }

  const result = (await response.json()) as T & { message?: string };

  if (!response.ok) {
    throw new Error(
      result.message || `Request failed (${response.status})`
    );
  }

  return result;
}

export async function getPeople(
  params?: GetPeopleParams
): Promise<Person[]> {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.set("search", params.search);
  if (params?.role) searchParams.set("role", params.role);
  if (params?.team) searchParams.set("team", params.team);

  const query = searchParams.toString();
  const url = query ? `${BASE_URL}?${query}` : BASE_URL;

  const result = await request<{ data: Person[]; total: number }>(url);

  return result.data;
}

export async function createPerson(
  person: PersonInput
): Promise<Person> {
  const result = await request<{ data: Person }>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(person),
  });

  return result.data;
}

export async function updatePerson(
  id: string,
  changes: Partial<PersonInput>
): Promise<Person> {
  const result = await request<{ data: Person }>(
    `${BASE_URL}/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(changes),
    }
  );

  return result.data;
}

export async function deletePerson(id: string): Promise<void> {
  await request<{ message: string }>(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}
