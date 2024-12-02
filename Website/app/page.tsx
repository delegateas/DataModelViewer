import Image from "next/image";
import List from "./List";

export default function Home() {
  return (
    <div className='flex flex-col gap-5'>
      <List />
    </div>
  );
}
