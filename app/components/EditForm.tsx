'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Person, Team } from '@/types/person';
import ProfileAvatar from './ProfileAvatar';

const TEAM_OPTIONS: Team[] = [
  'Design',
  'Product',
  'Marketing',
  'Technology',
];

type EditFormProps = {
  user: Person;
  onSave: (user: Person) => Promise<void>;
  onCancel: () => void;
  onRemovePhoto: () => void;
};

type FormValues = Omit<Person, 'id' | 'image' | 'teams'>;

const EditForm = ({
  user,
  onSave,
  onCancel,
  onRemovePhoto,
}: EditFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: user.name,
      username: user.username,
      gender: user.gender,
      status: user.status,
      role: user.role,
      email: user.email,
    },
  });

  const [selectedImage, setSelectedImage] = useState(user.image || '');
  const [selectedTeams, setSelectedTeams] = useState<Team[]>(user.teams || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (data: FormValues) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const image = selectedImage.startsWith('blob:') ? '' : selectedImage;

      await onSave({
        ...user,
        ...data,
        image,
        teams: selectedTeams,
      });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to save person'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleRemovePhoto = () => {
    if (selectedImage.startsWith('blob:')) {
      URL.revokeObjectURL(selectedImage);
    }
    setSelectedImage('');
    onRemovePhoto();
  };

  const toggleTeam = (team: Team) => {
    setSelectedTeams((current) =>
      current.includes(team)
        ? current.filter((item) => item !== team)
        : [...current, team]
    );
  };

  return (
    <div className="fixed inset-0 flex  items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold mb-4">
          {user.id ? 'Edit Profile' : 'Add Member'}
        </h3>
        <div className="flex flex-col items-center mb-4">
          <div className="mb-2">
            <ProfileAvatar src={selectedImage} alt="Profile" size={80} />
          </div>
          <div className="flex gap-2">
            <label
              htmlFor="image-upload"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer"
            >
              Change Photo
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              Remove Photo
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {errors.name && (
                <span className="text-red-500 text-sm">
                  {errors.name.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Enter a valid email',
                  },
                })}
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {errors.email && (
                <span className="text-red-500 text-sm">
                  {errors.email.message}
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                {...register('username', {
                  required: 'Username is required',
                })}
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="@username"
              />
              {errors.username && (
                <span className="text-red-500 text-sm">
                  {errors.username.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                {...register('gender')}
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                {...register('role', { required: 'Role is required' })}
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select a role</option>
                <option value="Product Designer">Product Designer</option>
                <option value="Product Manager">Product Manager</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="UX Designer">UX Designer</option>
                <option value="UX Copywriter">UX CopyWriter</option>
                <option value="FullStack Developer">FullStack Developer</option>
              </select>
              {errors.role && (
                <span className="text-red-500 text-sm">
                  {errors.role.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                {...register('status', { required: 'Status is required' })}
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select a status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              {errors.status && (
                <span className="text-red-500 text-sm">
                  {errors.status.message}
                </span>
              )}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Teams
            </label>
            <div className="flex flex-wrap gap-2 mt-1 border border-gray-300 rounded-lg p-2">
              {TEAM_OPTIONS.map((team) => {
                const isSelected = selectedTeams.includes(team);
                return (
                  <button
                    key={team}
                    type="button"
                    onClick={() => toggleTeam(team)}
                    className={`rounded-full px-3 py-1 text-sm flex items-center gap-1 ${
                      isSelected
                        ? 'bg-purple-100 text-purple-500'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {team}
                    {isSelected && (
                      <span className="text-gray-400" aria-hidden>
                        ×
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          {submitError && (
            <p className="mb-3 text-sm text-red-600">{submitError}</p>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditForm;
