const HeroSection = () => {
    return (
        <section className="flex flex-col gap-4 items-center justify-center">
            <article>
                <p>Адаптивен онлайн магазин</p>
                <h1>Пусни. Продавай. Адаптирай.</h1>
                <p>Вземи всичко необходимо за изграждане на онлайн продажби</p>
                <button>Започни безплатно</button>
                <p>Започни безплатно за 14 дни.</p>
            </article>
            <article className="bg-primary/10 w-full flex items-center justify-center">
                <div className="flex items-center justify-center gap-4">
                    <ul>
                        <li>Онлайн плащания</li>
                        <li>Лесно за настройсване</li>
                        <li>Оптимизиран за мобилни устройства</li>
                    </ul>


                    <iframe
                        width="560"
                        height="315"
                        src="https://www.youtube.com/embed/mMNGqvyngLE"
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                    />
                </div>
            </article>
        </section>
    )
}

export default HeroSection
