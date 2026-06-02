import Image from "next/image";
import { LandingSection, LandingSectionTitle } from "./shared";

const BuiltInChat = () => {
  return (
    <LandingSection id="support">
      <LandingSectionTitle as="h1" className="max-w-3xl mx-auto">
        На всяка стъпка сме винаги до теб
      </LandingSectionTitle>

      <div className="mt-12 grid gap-8 md:grid-cols-2">

        <article

          className="flex flex-col overflow-hidden rounded-2xl bg-[#111111]"
        >
          <div
            className="relative flex items-center justify-center p-6"
          >
            <div className="relative h-56 w-full sm:h-[20rem]">
              <Image
                src="/ask-for-help-3.png"
                alt="Вграден чат"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <div className="flex flex-1 flex-col px-6 py-8 sm:px-10">
            <h2 className="font-heading text-xl font-bold sm:text-2xl text-white">Вграден чат</h2>
            <p className="mt-3 text-base leading-relaxed text-white">
              Имаме вътрешен чат за да може да отговорим на въпросите ти бързо и ефективно (всеки ден от 9:00 до 22:00)
            </p>
          </div>
        </article>
        <article

          className="flex flex-col overflow-hidden rounded-2xl bg-white border border-black"
        >
          <div
            className="relative flex items-center justify-center p-6"
          >
            <div className="relative h-56 w-full sm:h-[20rem]">
              <Image
                src="/test-2.png"
                alt="Различни чатове за различни нужди"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <div className="flex flex-1 flex-col px-6 py-8 sm:px-10">
            <h2 className="font-heading text-xl font-bold sm:text-2xl text-black">Различни чатове за различни нужди</h2>
            <p className="mt-3 text-base leading-relaxed text-black">
              Може да отваряш колкото си искаш чатове за различни въпроси. Организираността е на първо място
            </p>
          </div>
        </article>
      </div>
    </LandingSection>
  );
};

export default BuiltInChat;
