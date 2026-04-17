const UsersTable = ({ users }) => {
  return (
    <div className="overflow-x-auto bg-white shadow rounded-lg p-4">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gray-100">
            {["ID","First Name","Last Name","Email","Mobile","Rating","Wallet Amount","Action"].map((head, i) => (
              <th key={i} className="px-4 py-2 text-left text-gray-600">{head}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b">
              <td className="px-4 py-2">{user.id}</td>
              <td className="px-4 py-2">{user.firstName}</td>
              <td className="px-4 py-2">{user.lastName}</td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">{user.mobile}</td>
              <td className="px-4 py-2">{user.rating}</td>
              <td className="px-4 py-2">{user.wallet}</td>
              <td className="px-4 py-2 space-x-2">
                <button className="bg-teal-500 text-white px-2 py-1 rounded">History</button>
                <button className="bg-blue-500 text-white px-2 py-1 rounded">Edit</button>
                <button className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;