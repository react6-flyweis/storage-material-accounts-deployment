type TitleSubtitleProps = {
  title: string;
  subtitle: string;
  titleClassName?: string;
  subtitleClassName?: string;
};

const TitleSubtitle: React.FC<TitleSubtitleProps> = ({
  title,
  subtitle,
  titleClassName = "",
  subtitleClassName = "",
}) => {
  return (
    <div className="flex items-start gap-1 flex-col">
      <h1
        className={`xl:text-2xl text-xl font-bold text-gray-800 md:mb-2 mb-1 ${titleClassName}`}
      >
        {title}
      </h1>
      <p
        className={`text-[#4B5563]) md:text-base font-normal text-sm ${subtitleClassName}`}
      >
        {subtitle}
      </p>
    </div>
  );
};

export default TitleSubtitle;
