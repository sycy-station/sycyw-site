import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import { Block, Prose, CardGrid, Steps, StatusRow, Empty, Actions, PageHero } from '@/components/Section';
import Filter from '@/components/Filter';
import { getPage } from '@/data/pages';
import {
  BENEFITS,
  CULTURE,
  deriveJobCategories,
  JOBS,
  JOBS_EMPTY_NOTE,
  JOBS_EMPTY_TITLE,
  JOIN_CTA,
  JOIN_HERO,
  PROCESS,
} from '@/data/join';

const page = getPage('join');

export const metadata: Metadata = {
  title: page.title,
  description: page.seoDescription,
  alternates: { canonical: page.canonicalPath },
  openGraph: {
    title: `${page.title} — 森韵次元坞`,
    description: page.seoDescription,
    url: page.canonicalPath,
    images: [{ url: JOIN_HERO.heroImage, alt: JOIN_HERO.heroImageAlt }],
  },
};

export default function JoinPage() {
  const openJobs = JOBS.filter((job) => job.status === 'open');

  return (
    <PageShell page={page}>
      <PageHero
        description={JOIN_HERO.heroDescription}
        image={JOIN_HERO.heroImage}
        imageAlt={JOIN_HERO.heroImageAlt}
      />
      <Block kicker="CULTURE" title="团队文化">
        <CardGrid
          items={[...CULTURE]
            .sort((a, b) => a.order - b.order)
            .map((item) => ({
              key: item.title,
              no: item.icon,
              title: item.title,
              text: item.description,
            }))}
        />
      </Block>

      <Block kicker="OPENINGS" title="开放职位">
        {openJobs.length ? (
          <Filter
            label="职位分类"
            categories={deriveJobCategories(openJobs)}
            items={openJobs.map((job) => ({
              id: job.id,
              categoryId: job.categoryId,
              node: (
                <div className="job-card">
                  <header className="job-head">
                    <h3 className="job-title">{job.title}</h3>
                    <span className="job-meta">
                      {job.categoryLabel} / {job.location}
                    </span>
                  </header>
                  <p className="job-desc">{job.description}</p>
                  {job.requirements.length > 0 && (
                    <ul className="job-reqs" role="list">
                      {job.requirements.map((req) => (
                        <li key={req}>{req}</li>
                      ))}
                    </ul>
                  )}
                  <Actions items={[{ label: job.applyLabel, url: job.applyUrl }]} />
                </div>
              ),
            }))}
          />
        ) : (
          <Empty title={JOBS_EMPTY_TITLE} note={JOBS_EMPTY_NOTE} />
        )}
      </Block>

      {BENEFITS.length > 0 && (
        <Block kicker="BENEFITS" title="员工福利">
          <StatusRow
            items={[...BENEFITS]
              .sort((a, b) => a.order - b.order)
              .map((item) => ({
                key: item.title,
                no: item.icon,
                title: item.title,
                text: item.description,
              }))}
          />
        </Block>
      )}

      <Block kicker="PROCESS" title="招聘流程">
        <Steps
          items={[...PROCESS]
            .sort((a, b) => a.order - b.order)
            .map((item) => ({
              key: item.step,
              step: item.step,
              title: item.title,
              text: item.description,
            }))}
        />
      </Block>

      <Block kicker="CONTACT" title={JOIN_CTA.title}>
        <Prose paragraphs={[JOIN_CTA.description]} />
        <Actions items={[JOIN_CTA.primaryAction, JOIN_CTA.secondaryAction]} />
      </Block>
    </PageShell>
  );
}