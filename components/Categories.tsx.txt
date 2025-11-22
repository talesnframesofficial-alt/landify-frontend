export default function Categories() {
  return (
    <section className="container mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-4">
      {['Residential','Land','Commercial','Industrial'].map((item) => (
        <div key={item} className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer text-center">
          {item}
        </div>
      ))}
    </section>
  );
}
