'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiSearch, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import ProfileAvatar from '../components/ProfileAvatar';
import EditForm from '../components/EditForm';
import FilterComponent from '../components/FilterComponents';
import UserDetails from '../components/UserDetails';
import {
  createPerson,
  deletePerson,
  getPeople,
  updatePerson,
} from '../lib/api/people';
import type { Person, PersonInput, Team } from '@/types/person';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

const newUserTemplate: Person = {
  id: '',
  image: '',
  name: '',
  username: '',
  gender: '',
  status: 'Active',
  role: '',
  email: '',
  teams: [],
};

const filters = [
  {
    label: 'Roles',
    options: [
      'Product Designer',
      'Product Manager',
      'Frontend Developer',
      'Backend Developer',
    ],
  },
  {
    label: 'Teams',
    options: ['Design', 'Product', 'Marketing', 'Technology'],
  },
];

function toPersonInput(person: Person): PersonInput {
  return {
    image: person.image?.startsWith('blob:') ? '' : person.image || '',
    name: person.name,
    username: person.username,
    gender: person.gender,
    status: person.status,
    role: person.role,
    email: person.email,
    teams: person.teams,
  };
}

const Page = () => {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [people, setPeople] = useState<Person[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [roleFilters, setRoleFilters] = useState<string[]>([]);
  const [teamFilters, setTeamFilters] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<Person | null>(null);
  const [editingUser, setEditingUser] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadPeople = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getPeople();
      setPeople(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load people'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPeople();
  }, [loadPeople]);

  useEffect(() => {
    const query = searchParams.get('query');
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();

    const next = people.filter((person) => {
      const matchesSearch =
        !query ||
        person.name.toLowerCase().includes(query) ||
        person.username.toLowerCase().includes(query) ||
        person.email.toLowerCase().includes(query);

      const matchesRole =
        roleFilters.length === 0 || roleFilters.includes(person.role);

      const matchesTeam =
        teamFilters.length === 0 ||
        person.teams.some((team) => teamFilters.includes(team));

      return matchesSearch && matchesRole && matchesTeam;
    });

    setFilteredPeople(next);
  }, [people, searchQuery, roleFilters, teamFilters]);

  const handleRowClick = (user: Person) => {
    setSelectedUser(user);
  };

  const handleDelete = async (userToDelete: Person) => {
    if (!userToDelete.id) return;

    const confirmed = window.confirm(
      `Delete ${userToDelete.name}? This cannot be undone.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setActionError(null);
    setActionMessage(null);

    try {
      await deletePerson(userToDelete.id);
      setPeople((current) =>
        current.filter((person) => person.id !== userToDelete.id)
      );
      if (selectedUser?.id === userToDelete.id) {
        setSelectedUser(null);
      }
      if (editingUser?.id === userToDelete.id) {
        setEditingUser(null);
      }
      setActionMessage(`${userToDelete.name} deleted successfully.`);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to delete person'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (userToEdit: Person) => {
    setActionError(null);
    setEditingUser(userToEdit);
  };

  const handleAddMember = () => {
    setActionError(null);
    setEditingUser({ ...newUserTemplate });
  };

  const handleSaveEdit = async (editedUser: Person) => {
    setActionError(null);
    setActionMessage(null);

    const payload = toPersonInput(editedUser);

    if (editedUser.id) {
      const updated = await updatePerson(editedUser.id, payload);
      setPeople((current) =>
        current.map((person) =>
          person.id === updated.id ? updated : person
        )
      );
      setSelectedUser((current) =>
        current?.id === updated.id ? updated : current
      );
      setActionMessage(`${updated.name} updated successfully.`);
    } else {
      const created = await createPerson(payload);
      setPeople((current) =>
        [...current, created].sort((a, b) => a.name.localeCompare(b.name))
      );
      setActionMessage(`${created.name} added successfully.`);
    }

    setEditingUser(null);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (query) {
      newSearchParams.set('query', query);
    } else {
      newSearchParams.delete('query');
    }
    window.history.pushState(null, '', `?${newSearchParams.toString()}`);
  };

  const handleFilterChange = (
    filterLabel: string,
    selectedOptions: string[]
  ) => {
    if (filterLabel === 'Roles') {
      setRoleFilters(selectedOptions);
    } else if (filterLabel === 'Teams') {
      setTeamFilters(selectedOptions as Team[]);
    }
  };

  const columnHelper = createColumnHelper<Person>();

  const columns = [
    columnHelper.accessor('name', {
      cell: (info) => (
        <div className="flex items-center">
          <ProfileAvatar
            src={info.row.original.image}
            alt=""
            size={32}
            className="mr-2"
          />
          <div>
            <div>{info.getValue()}</div>
            <div className="text-sm text-gray-500">
              {info.row.original.username}
            </div>
          </div>
        </div>
      ),
      header: 'Name',
    }),
    columnHelper.accessor('status', {
      cell: (info) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            info.getValue() === 'Active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {info.getValue()}
        </span>
      ),
      header: 'Status',
    }),
    columnHelper.accessor('role', {
      cell: (info) => info.getValue(),
      header: 'Role',
    }),
    columnHelper.accessor('email', {
      cell: (info) => info.getValue(),
      header: 'Email address',
    }),
    columnHelper.accessor('teams', {
      cell: (info) => (
        <div className="flex flex-wrap gap-1">
          {info.getValue().map((team) => (
            <span
              key={team}
              className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800"
            >
              {team}
            </span>
          ))}
          {info.getValue().length > 3 && (
            <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
              +{info.getValue().length - 3}
            </span>
          )}
        </div>
      ),
      header: 'Teams',
    }),
    columnHelper.display({
      id: 'actions',
      cell: (info) => (
        <div className="flex gap-2">
          <button
            type="button"
            className="p-1 text-gray-500 hover:text-red-500 disabled:opacity-50"
            disabled={isDeleting}
            onClick={(e) => {
              e.stopPropagation();
              void handleDelete(info.row.original);
            }}
          >
            <FiTrash2 size={16} />
          </button>
          <button
            type="button"
            className="p-1 text-gray-500 hover:text-blue-500"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(info.row.original);
            }}
          >
            <FiEdit2 size={16} />
          </button>
        </div>
      ),
      header: '',
    }),
  ];

  const table = useReactTable({
    data: filteredPeople,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  return (
    <div className="m-auto bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4 ">
        <h2 className=" mt-5  mx-5  text-xl font-bold">
          Team members{' '}
          <span className="text-sm px-2 py-1 font-normal text-indigo-600 bg-purple-100 rounded-full">
            {people.length} {people.length === 1 ? 'user' : 'users'}
          </span>
        </h2>
        <div className="flex gap-2 mt-5">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="border rounded-lg px-3 py-2 pl-8"
              value={searchQuery}
              onChange={handleSearch}
            />
            <FiSearch className="absolute left-2  top-1/2 transform -translate-y-4 text-gray-400" />
          </div>
          <FilterComponent
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          <button
            type="button"
            className="bg-indigo-600 text-white px-4 py-2 mr-4 rounded-lg flex items-center gap-2"
            onClick={handleAddMember}
          >
            <FiPlus /> ADD MEMBER
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="mx-5 mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {actionMessage}
        </div>
      )}
      {actionError && (
        <div className="mx-5 mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="px-5 py-12 text-center text-gray-500">
          Loading team members...
        </div>
      ) : error ? (
        <div className="px-5 py-12 text-center">
          <p className="mb-4 text-red-600">{error}</p>
          <button
            type="button"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white"
            onClick={() => void loadPeople()}
          >
            Retry
          </button>
        </div>
      ) : filteredPeople.length === 0 ? (
        <div className="px-5 py-12 text-center text-gray-500">
          {people.length === 0
            ? 'No team members yet. Click ADD MEMBER to create one.'
            : 'No team members match your search or filters.'}
        </div>
      ) : (
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border border-x-0 min-w-fit">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left p-3 border-b text-sm font-medium text-gray-500"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3 border-b">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedUser && (
        <UserDetails
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
      {editingUser && (
        <EditForm
          user={editingUser}
          onSave={handleSaveEdit}
          onCancel={() => setEditingUser(null)}
          onRemovePhoto={() => {
            setEditingUser((current) =>
              current ? { ...current, image: '' } : current
            );
          }}
        />
      )}
    </div>
  );
};

export default Page;
