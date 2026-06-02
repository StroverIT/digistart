"use client";
import Image from 'next/image';
import React, { useState } from 'react'

const benefitImages = []

type DropDownProps = {
    title: string;
    description: string;
}

const DropDown = ({ title, description }: DropDownProps) => {
    return (
        <li>
            <h1>{title}</h1>
            <p>{description}</p>
        </li>
    )
}

const Benefits = () => {

    // const [selectedBenefit, setSelectedBenefit] = useState<typeof benefits[number] | null>(null);
    return (
        <section>
            <h1>Създай онлайн магазин за рекордно време - започни от нула до това да продаваш в рамките на часове, не седмици</h1>
            <article className="space-y-6 flex items-center justify-center" id="benefits">
                <ul>
                    <DropDown title="Автоматично създаване на товарителници" description="Автоматично при създаване и връщане на поръчка се създава товарителница от избрания доставчик" />
                    <DropDown title="Онлайн плащания" description="Клиентите ти имат възможност да плащат с абсолютно всичко което пожелаеш" />
                    <DropDown title="Вграден пиксел" description="" />
                    <DropDown title="Digi Analytics" description="Наши системи които проследяват клиентите ти за специализирано преживяване" />
                    <DropDown title="Включен Hosting и SSL сертификат" description="Ние се грижим за цялата техническа част. Твоята грижа е само да изпращаш пратки" />
                </ul>
                {/* Тука показваме снимката*/}
                <div className="relative h-96 w-96">
                    <Image src="/templates/clothing/11.png" alt="Benefit 1" fill className="object-contain" />
                </div>
            </article>
        </section>
    )
}

export default Benefits
