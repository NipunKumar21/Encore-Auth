import useAuth from "../hooks/useAuth";

const AdminPage: React.FC = () => {
    useAuth();
    return (
        <div> 
          <h1>Admin Page</h1>
        </div>
    );
  };
  
  export default AdminPage;