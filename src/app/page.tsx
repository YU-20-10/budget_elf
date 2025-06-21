// import Image from "next/image";

export default function Home() {
  return (
    <main>
      <section className="flex justify-center bg-[url('/banner_2.svg')] bg-cover bg-center h-64 w-full lg:h-100">
        <div className="container max-w-7xl px-4 flex justify-center items-center">
          <div className="font-bold text-center">
            <h2 className="inline-block text-2xl bg-primary mb-3">
              記帳小精靈
            </h2>
            <p className="text-lg bg-primary mb-3">提供給您共同記帳的新選擇~</p>
            <div>
              <a
                href="#introduction"
                className="block border border-white rounded-xl bg-primary w-full p-3 text-white hover:text-black hover:bg-secondary hover:border-0"
              >
                進一步了解
              </a>
            </div>
          </div>
        </div>
      </section>
      <section className="flex justify-center w-full" id="introduction">
        <div className="container max-w-7xl px-4 flex justify-center">
          <div className="py-10 w-full">
            <div className="flex w-full mb-10">
              <div className="bg-[url('/introduction_book.svg')] bg-cover bg-center min-h-40 lg:min-h-50 w-1/2"></div>
              <div className="w-1/2 p-3 lg-p-6 flex items-center">
                <div>
                  <h2 className="font-bold text-lg">多帳簿設計</h2>
                  <p>
                    依照個人需求,無論是日常花費、家庭開支或是其他收入及支出管理，都可以新增不同帳簿進行管理
                  </p>
                </div>
              </div>
            </div>
            <div className="flex w-full mb-10">
              <div className="w-1/2 p-3 lg-p-6 flex items-center">
                <div>
                  <h2 className="font-bold text-lg">
                    朋友、情侶、家人共同記帳
                  </h2>
                  <p>
                    可邀請其他人共同記帳，滿足朋友、家人或是情侶之間共同記帳的需求
                  </p>
                </div>
              </div>
              <div className="bg-[url('/introduction_share.svg')] bg-cover bg-center min-h-40 lg:min-h-50 w-1/2"></div>
            </div>
            {/* <div className="flex w-full">
              <div className="bg-[url('/introduction_card.svg')] bg-cover bg-center min-h-40 lg:min-h-50 w-1/2"></div>
              <div className="w-1/2 p-3 lg-p-6 flex items-center">
                <div>
                  <h2>管理信用卡回饋</h2>
                  <p>自行設定信用卡回饋</p>
                </div>
              </div>
            </div> */}
          </div>
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
