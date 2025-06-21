import Image from "next/image";
import AutoPlaySwiper from "@/components/Swiper/AutoPlaySwiper";

const swiperSlideArr = [
  <div key="slide1" className="h-64 lg:h-100">
    <h3 className="text-center text-xl font-bold text-white mb-4">
      登入或註冊後開始使用
    </h3>
    <div className="relative w-full h-full">
      <Image
        src="/gif/login.gif"
        alt="login.gif"
        fill
        unoptimized
        style={{ objectFit: "contain" }}
      ></Image>
    </div>
  </div>,
  <div key="slide2" className="h-64 lg:h-100">
    <h3 className="text-center text-xl font-bold text-white mb-4">
      在帳簿管理中點擊新增帳簿
    </h3>
    <div className="relative w-full h-full">
      <Image
        src="/gif/addAccountingBook.gif"
        alt="addAccountingBook.gif"
        fill
        unoptimized
        style={{ objectFit: "contain" }}
      ></Image>
    </div>
  </div>,
  <div key="slide3" className="h-64 lg:h-100">
    <h3 className="text-center text-xl font-bold text-white mb-4">
      點擊前往記帳開始使用
    </h3>
    <div className="relative w-full h-full">
      <Image
        src="/gif/addAccountingRecord.gif"
        alt="addAccountingRecord.gif"
        fill
        unoptimized
        style={{ objectFit: "contain" }}
      ></Image>
    </div>
  </div>,
  <div key="slide3" className="h-64 lg:h-100">
    <h3 className="text-center text-xl font-bold text-white mb-4">
      點選共用設定邀請其他使用者
    </h3>
    <div className="relative w-full h-full">
      <Image
        src="/gif/addShareInvite.gif"
        alt="addShareInvite.gif"
        fill
        unoptimized
        style={{ objectFit: "contain" }}
      ></Image>
    </div>
  </div>,
  <div key="slide3" className="h-64 lg:h-100">
    <h3 className="text-center text-xl font-bold text-white mb-4">
      被邀請人選擇接受邀請後開始記帳
    </h3>
    <div className="relative w-full h-full">
      <Image
        src="/gif/acceptInvite.gif"
        alt="acceptInvite.gif"
        fill
        unoptimized
        style={{ objectFit: "contain" }}
      ></Image>
    </div>
  </div>,
];

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
      <section className="flex justify-center w-full bg-secondary py-6 lg:py-10">
        <div className="container max-w-7xl px-4 flex justify-center">
          <AutoPlaySwiper swiperSlideArr={swiperSlideArr}></AutoPlaySwiper>
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
