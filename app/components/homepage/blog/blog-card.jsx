// @flow strict
import { timeConverter } from '@/utils/time-converter';
import Image from 'next/image';
import Link from 'next/link';
import { BsHeartFill } from 'react-icons/bs';
import { FaCommentAlt } from 'react-icons/fa';

function BlogCard({ blog }) {

  return (
    <article className="group flex flex-col bg-[var(--sw-cell)]">
      <div className="h-44 w-auto overflow-hidden border-b border-[var(--sw-grid-rule)] lg:h-52">
        <Image
          src={blog?.cover_image}
          height={1080}
          width={1920}
          alt=""
          className='sw-mono-img h-full w-full object-cover opacity-85 transition-opacity duration-300 group-hover:opacity-100'
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-[var(--sw-dim)]">
          <p>{timeConverter(blog.published_at)}</p>
          <div className="flex items-center gap-3">
            <p className="flex items-center gap-1">
              <BsHeartFill />
              <span>{blog.public_reactions_count}</span>
            </p>
            {blog.comments_count > 0 &&
              <p className="flex items-center gap-1">
                <FaCommentAlt />
                <span>{blog.comments_count}</span>
              </p>
            }
          </div>
        </div>
        <Link target='_blank' href={blog.url}>
          <p className='sw-cell-title my-3 !text-[15px] transition-colors duration-200 hover:text-[var(--sw-silver)]'>
            {blog.title}
          </p>
        </Link>
        <p className='mb-3 text-[10px] uppercase tracking-[0.2em] text-[var(--sw-dim)]'>
          {`${blog.reading_time_minutes} Min Read`}
        </p>
        <p className='sw-cell-body line-clamp-3'>
          {blog.description}
        </p>
      </div>
    </article>
  );
};

export default BlogCard;
