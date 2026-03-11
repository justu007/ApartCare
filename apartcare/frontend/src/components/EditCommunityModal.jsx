import { useState } from "react";
import { useDispatch } from "react-redux";
import { editCommunity } from "../features/community/communitySlice";

const EditCommunityModal = ({ community, onClose }) => {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    name: community.name,
    address: community.address,
    admin: {
      name: community.admin.name,
      email: community.admin.email,
      phone: community.admin.phone,
    },
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdminChange = (e) => {
    setForm({
      ...form,
      admin: { ...form.admin, [e.target.name]: e.target.value },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    dispatch(
      editCommunity({
        id: community.id,
        data: form,
      })
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">

      <div className="w-96 p-6 bg-white rounded">

        <h2 className="mb-4 text-xl font-bold">Edit Community</h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border"
            placeholder="Community Name"
          />

          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full p-2 border"
            placeholder="Address"
          />

          <h3 className="mt-4 font-semibold">Admin</h3>

          <input
            type="text"
            name="name"
            value={form.admin.name}
            onChange={handleAdminChange}
            className="w-full p-2 border"
            placeholder="Admin Name"
          />

          <input
            type="email"
            name="email"
            value={form.admin.email}
            onChange={handleAdminChange}
            className="w-full p-2 border"
            placeholder="Admin Email"
          />

          <input
            type="text"
            name="phone"
            value={form.admin.phone}
            onChange={handleAdminChange}
            className="w-full p-2 border"
            placeholder="Admin Phone"
          />

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 bg-gray-300 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-3 py-1 text-white bg-blue-600 rounded"
            >
              Update
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditCommunityModal;