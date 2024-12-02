import Image from "next/image";
import List from "../generated/List";

export default function Home() {
  return (
    <div className='flex flex-col gap-5 mx-5'>
      <List />
    </div>
  );
}
