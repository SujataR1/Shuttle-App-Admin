import Sidebar from "../../components/sidebar/Sidebar";
import TopNavbar from "../../components/navbar/TopNavbar";
import UsersTable from "../../components/tables/UsersTable";

const dummyUsers = Array.from({ length: 10 }, (_, i) => ({
  id: 100 + i,
  firstName: "User" + i,
  lastName: "Demo",
  email: `user${i}@demo.com`,
  mobile: "900000000" + i,
  rating: 5,
  wallet: "£0.00",
}));

const Users = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <TopNavbar />
        <div className="p-6">
          <UsersTable users={dummyUsers} />
        </div>
      </div>
    </div>
  );
};

export default Users;