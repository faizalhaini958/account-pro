import { SVGAttributes } from 'react';

export default function ApplicationLogo(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect width="40" height="40" rx="8" className="fill-indigo-600" />
            <path
                d="M12 10H17C20 10 22 12 22 15C22 16.5 21 17.5 20 18C21.5 18.5 23 20 23 22C23 26 20 28 17 28H12V10ZM15 17H17C18.5 17 19.5 16 19.5 15C19.5 14 18.5 13 17 13H15V17ZM15 25H17C19 25 20 24 20 22C20 20 19 19 17 19H15V25Z"
                className="fill-white"
            />
            <path d="M25 10H28L24 19H21L25 10Z" className="fill-white" opacity="0.5" />
            <path d="M26 28L31 16H28L24 25V28H26Z" className="fill-white" />
        </svg>
    );
}
