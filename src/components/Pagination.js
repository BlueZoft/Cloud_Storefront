import Link from "next/link";
export default function Pagination({ page, hasNext, path }) {
  return <nav aria-label="Product pages">
    {page > 1 && <Link href={`${path}?page=${page - 1}`}>Previous</Link>}
    <span> Page {page} </span>
    {hasNext && <Link href={`${path}?page=${page + 1}`}>Next</Link>}
  </nav>;
}
