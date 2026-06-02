import Image from 'next/image'

const BuiltInChat = () => {
    return (
        <section>
            <h1>На всяка стъпка сме винаги до теб</h1>
            <article className='flex items-center justify-center'>
                <div>
                    <div className="relative h-[40rem] w-[40rem]">
                        <Image src="/ask-for-help-3.png" alt="Built In Chat" fill className="object-contain z-5" />
                    </div>
                    <div>
                        <h2>Вграден чат</h2>
                        <p>Имаме вътрешен чат за да може да отговорим на въпросите ти бързо и ефективно (всеки ден от 9:00 до 22:00)                    </p>
                    </div>
                </div>
                <div>
                    <div className="relative h-[40rem] w-[40rem]">
                        <Image src="/ask-for-help-chat.png" alt="Built In Chat" fill className="object-contain z-5" />
                    </div>
                    <div>
                        <h2>Различни чатове за различни нужди</h2>
                        <p>Може да отваряш колкото си искаш чатове за различни въпроси. Организираността е на първо място</p>
                    </div>
                </div>
            </article>

        </section>
    )
}

export default BuiltInChat
