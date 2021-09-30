const arr = [
  {
    label: "name",
    value: "AJ",
  },
  {
    label: "age",
    value: 18,
  },
  {
    label: "address",
    value: "上海",
  },
]

const obj = arr.reduce(
  (accumulator, currentValue) => ({ ...accumulator, [currentValue.label]: currentValue.value }),
  {}
)
console.log(obj)
