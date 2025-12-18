<GlowCard key={experience.id} identifier={`experience-${experience.id}`}>
  <div className="p-3 relative">
    <Image
      src="/blur-23.svg"
      alt="Hero"
      width={1080}
      height={200}
      className="absolute bottom-0 opacity-80"
    />
    <div className="flex justify-center">
      <p className="text-xs sm:text-sm text-[#16f2b3]">
        {experience.duration}
      </p>
    </div>
    <div className="flex items-center gap-x-8 px-3 py-5">
      <div className="text-violet-500  transition-all duration-300 hover:scale-125">
        <BsPersonWorkspace size={36} />
      </div>
      <div>
        <p className="text-base sm:text-xl mb-2 font-medium uppercase">
          {experience.title}
        </p>
        <p className="text-sm sm:text-base">
          {experience.company}
        </p>

        {/* ← Add your description and link here */}
        <div className="mt-2">
          {experience.desc?.map((line, i) => (
            <p key={i} className="text-sm sm:text-base text-gray-300">
              {line}
            </p>
          ))}
        </div>
        {experience.link && (
          <a
            href={experience.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm text-[#16f2b3] mt-2 inline-block hover:underline"
          >
            Learn More
          </a>
        )}
      </div>
    </div>
  </div>
</GlowCard>
