export default function Home() {
  return (
    <main>
      <section className="flex justify-center bg-[url('/banner_2.svg')] bg-cover bg-center h-64 w-full lg:h-100">
        <div className="container max-w-7xl px-4 flex start">
          <div className="py-25">
            <h2 className="text-2xl">記帳小精靈</h2>
            <p>一起來記帳</p>
          </div>
          {/* <div className="bg-primary text-white p-4">Hello, Tailwind!</div> */}
          {/* <div className="bg-test-blue">test</div> */}
        </div>
      </section>
    </main>
  );
}

{
  // import Image from "next/image";
  /* <Image
  className="dark:invert"
  src="/next.svg"
  alt="Next.js logo"
  width={180}
  height={38}
  priority
/>; */
}
