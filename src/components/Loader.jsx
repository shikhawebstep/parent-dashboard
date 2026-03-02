
const Loader = () => {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <img src="/assets/loader.png" className="w-12 h-12 animate-spin [animation-duration:2s]" alt="Loading..." />
      {/* <HashLoader color="#FFDE14" loading={loading} size={size} /> */}
    </div>
  );
};

export default Loader;
