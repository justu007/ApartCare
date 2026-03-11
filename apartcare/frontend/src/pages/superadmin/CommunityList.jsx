import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCommunities } from "../../features/community/communitySlice";
import { toggleDeactivate } from "../../features/community/communitySlice";
import EditCommunityModal from "../../components/EditCommunityModal";
import { useState } from "react";

const CommunityList = () => {
  const dispatch = useDispatch();

  const { communities, loading } = useSelector((state) => state.community);
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  useEffect(() => {
    dispatch(fetchCommunities());
  }, [dispatch]);

  if (loading) return <p className="p-5">Loading communities...</p>;

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Communities</h1>

      <table className="w-full border border-gray-300">
        <thead className="text-white bg-gray-700">
          <tr>
            <th className="p-3 border">Community</th>
            <th className="p-3 border">Address</th>
            <th className="p-3 border">Admin Name</th>
            <th className="p-3 border">Admin Email</th>
            <th className="p-3 border">Admin Phone</th>
            <th className="p-3 border">Status</th>
          </tr>
        </thead>

        <tbody>
          {communities.map((community) => (
            <tr key={community.id} className="text-center border">
              <td className="p-3 border">{community.name}</td>
              <td className="p-3 border">{community.address}</td>
              <td className="p-3 border">{community.admin.name}</td>
              <td className="p-3 border">{community.admin.email}</td>
              <td className="p-3 border">{community.admin.phone}</td>
              <td className="p-3 border">
                {community.is_active ? (
                    <span className="px-2 py-1 text-green-700 bg-green-100 rounded">
                    Active
                    </span>
                ) : (
                    <span className="px-2 py-1 text-red-700 bg-red-100 rounded">
                    Inactive
                    </span>
                )}
              </td>
              <button
                className="px-2 py-1 text-white bg-yellow-500 rounded"
                onClick={() => setSelectedCommunity(community)}
              >
                Edit
              </button>

              <button
                onClick={() =>
                  dispatch(toggleDeactivate({
                    id: community.id,
                    is_active: community.is_active
                  }))
                }
                className={`px-3 py-1 rounded ${
                  community.is_active
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
                >
                {community.is_active ? "Active" : "Inactive"}
              </button>
            </tr>

          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CommunityList;