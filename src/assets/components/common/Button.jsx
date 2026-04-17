const Button = ({ title, onClick, loading }) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
    >
      {loading ? "Loading..." : title}
    </button>
  );
};

export default Button;