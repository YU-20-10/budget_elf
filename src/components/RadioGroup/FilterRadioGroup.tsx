"use client";

import { Field, Label, Radio, RadioGroup } from "@headlessui/react";
import { useState, useEffect } from "react";

// import { useState } from "react";

const plans = [
  { id: 1, name: "Startup", available: true },
  { id: 2, name: "Business", available: true },
  { id: 3, name: "Enterprise", available: false },
];

export default function FilterRadioGroup() {
  const [selected, setSelected] = useState(plans[0]);

  useEffect(() => {
    console.log(selected);
  }, [selected]);

  return (
    <RadioGroup
      value={selected}
      onChange={setSelected}
      aria-label="Server size"
    >
      {plans.map((plan) => (
        <Field key={plan.id}>
          <Radio value={plan} disabled={!plan.available} />
          <Label>{plan.name}</Label>
        </Field>
      ))}
    </RadioGroup>
  );
}
