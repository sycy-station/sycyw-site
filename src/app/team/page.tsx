import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import { Block, Prose, CardGrid, StatusRow, Empty, Actions, PageHero } from '@/components/Section';
import { getPage } from '@/data/pages';
import {
  COMPOSITION,
  CORE_MEMBERS,
  CULTURE,
  LEADERSHIP,
  MEMBER_EMPTY_NOTE,
  TEAM_CTA,
  TEAM_HERO,
  WORKSPACE_IMAGES,
} from '@/data/team';

const page = getPage('team');

export const metadata: Metadata = {
  title: page.title,
  description: page.seoDescription,
  alternates: { canonical: page.canonicalPath },
  openGraph: {
    title: `${page.title} — 森韵次元坞`,
    description: page.seoDescription,
    url: page.canonicalPath,
    images: [{ url: TEAM_HERO.heroImage, alt: TEAM_HERO.heroImageAlt }],
  },
};

export default function TeamPage() {
  const members = [...LEADERSHIP, ...CORE_MEMBERS].sort((a, b) => a.order - b.order);

  return (
    <PageShell page={page}>
      <PageHero
        description={TEAM_HERO.heroDescription}
        image={TEAM_HERO.heroImage}
        imageAlt={TEAM_HERO.heroImageAlt}
      />
      <Block kicker="COMPOSITION" title="团队构成">
        <StatusRow
          items={[...COMPOSITION]
            .sort((a, b) => a.order - b.order)
            .map((item, i) => ({
              key: item.title,
              no: String(i + 1).padStart(2, '0'),
              title: item.title,
              text: item.description,
            }))}
        />
      </Block>

      <Block kicker="MEMBERS" title="成员介绍">
        {members.length ? (
          <CardGrid
            columns={2}
            items={members.map((member) => ({
              key: member.name,
              no: member.role,
              title: member.name,
              text: member.bio ?? member.role,
            }))}
          />
        ) : (
          <Empty note={MEMBER_EMPTY_NOTE} />
        )}
      </Block>

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

      {WORKSPACE_IMAGES.length > 0 && (
        <Block kicker="WORKSPACE" title="工作环境">
          <CardGrid
            columns={2}
            items={WORKSPACE_IMAGES.map((image, i) => ({
              key: image.src,
              no: String(i + 1).padStart(2, '0'),
              title: image.caption ?? image.alt,
              text: image.alt,
            }))}
          />
        </Block>
      )}

      <Block kicker="JOIN US" title={TEAM_CTA.title}>
        <Prose paragraphs={[TEAM_CTA.description]} />
        <Actions items={[{ label: TEAM_CTA.buttonLabel, url: TEAM_CTA.buttonUrl }]} />
      </Block>
    </PageShell>
  );
}