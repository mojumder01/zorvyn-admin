import { Shell } from '../components/layout/Shell';
import { Link } from '../lib/router';

export function NotFound({ what = 'Page', back = '/' }: { what?: string; back?: string }) {
  return (
    <Shell title={`${what} not found`}>
      <div className="rounded-2xl border border-dashed border-line p-10 text-center">
        <p className="text-ink-2">This {what.toLowerCase()} doesn't exist — it may have been deleted or the demo data was reset.</p>
        <Link to={back} className="mt-4 inline-block font-medium text-brand hover:underline">
          Go back
        </Link>
      </div>
    </Shell>
  );
}
