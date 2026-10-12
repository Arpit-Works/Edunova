export type Team = "Design" | "Product" | "Marketing" | "Technology";

export type Person = {
  id: string;
  image: string;
  name: string;
  username: string;
  gender: string;
  status: "Active" | "Inactive";
  role: string;
  email: string;
  teams: Team[];
};

export type PersonInput = Omit<Person, "id">;
