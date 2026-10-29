import { ArrowDownIcon, ArrowUpRightIcon } from './Icon';

type Props = {
  href: string;
  children: React.ReactNode;
  variant: 'light-filled' | 'light-outline' | 'dark-filled' | 'dark-outline';
  icon?: 'arrow-up-right' | 'arrow-down' | 'none';
  size?: 'default' | 'large';
  className?: string;
};

/** Fully rounded pill buttons. Variants are named for the surface they sit on. */
export function Button({
  href,
  children,
  variant,
  icon = 'arrow-up-right',
  size = 'default',
  className = '',
}: Props) {
  const external = /^https?:\/\//.test(href);
  return (
    <a
      className={`btn btn--${variant} ${size === 'large' ? 'btn--large' : ''} ${className}`.trim()}
      href={href}
      {...(external ? { rel: 'noopener' } : {})}
    >
      <span>{children}</span>
      {icon === 'arrow-up-right' ? <ArrowUpRightIcon className="btn__icon" /> : null}
      {icon === 'arrow-down' ? <ArrowDownIcon className="btn__icon btn__icon--down" /> : null}
    </a>
  );
}
