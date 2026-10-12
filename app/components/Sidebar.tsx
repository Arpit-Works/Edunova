'use client' ;
import Image from "next/image";
import Page from "../people/Page"
import { Suspense, useState } from "react";


type value = 'overView' | 'People' ;

export default function Sidebar() {
  const [activeComponent, setActiveComponent] = useState<value>('overView'); 
  const handleClick = (component:value) =>{
    setActiveComponent(component)
  }
  return (
    <div className="flex h-svh">
      <div className="w-64 bg-white p-4">
        <ul>
          <li className={`${activeComponent === 'overView'? 'text-indigo-600': ''} flex p-2 text-lg font-semibold group hover:text-indigo-600`} onClick={()=>handleClick('overView')}>
            <Image
              className={`${activeComponent === 'overView'? 'bg-indigo-600': ''} bg-black rounded mx-1 group-hover:bg-indigo-600`}
              src="/images/gridButton.svg"
              height={24}
              width={24}
              alt="gridButton"
            />
            Overview
          </li>

          <li className={`${activeComponent === 'People'? 'group text-indigo-600': ''} flex p-2 text-lg font-semibold group hover:text-indigo-600`} onClick={()=>handleClick('People')}>
          <Image
              className={`${activeComponent === 'People'? 'bg-indigo-600': ''} bg-black rounded mx-1 group-hover:bg-indigo-600`}
              src="/images/gridButton.svg"
              height={22}
              width={24}
              alt="gridButton"
            />
            People Directory
          </li>
        </ul>
      </div>

      {/* <!-- Main Content --> */}
      <div className="flex-1 p-10  ">
        <div className="container h-full border rounded-lg ">
          {activeComponent === 'People'? (
            <Suspense fallback={<div className="m-4 text-gray-500">Loading directory...</div>}>
              <Page/>
            </Suspense>
          ) : (
            <h1 className="text-4xl font-bold m-4">Welcome, Admin!</h1>
          )}
      </div>
    </div>
    </div>
  );
}
