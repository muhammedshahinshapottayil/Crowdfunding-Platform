function Loading() {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
              </div>
              <h3 className="text-xl text-gray-800 font-bold mb-4">
                <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
              </h3>
              <div className="text-gray-800 mb-4">
                {" "}
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              </div>
              <div className="flex items-center mb-2">
                <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
              </div>
              <div className="flex items-center">
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Loading;
