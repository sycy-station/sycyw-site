import type { Metadata } from 'next';
import PageShell from '@/components/PageShell';
import { Block, Prose, Creed, Timeline } from '@/components/Section';
import { ABOUT } from '@/data/about';
import { getPage } from '@/data/pages';

const page = getPage('about');

export const metadata: Metadata = {
  title: page.title,
  description: page.seoDescription,
  alternates: { canonical: page.canonicalPath },
};

export default function AboutPage() {
  const timeline = [...ABOUT.timeline].sort((a, b) => a.order - b.order);

  return (
    <PageShell page={page} bodyClass="about-body">
      <div className="about-main">
        <Block kicker="OUR STORY" title={ABOUT.story.sectionTitle}>
          <Prose paragraphs={ABOUT.story.storyParagraphs} />
        </Block>

        <Block kicker="OUR MISSION" title={ABOUT.mission.title}>
          <Prose lead={ABOUT.mission.statement} paragraphs={[ABOUT.mission.description]} />
          <Creed
            items={[...ABOUT.values]
              .sort((a, b) => a.order - b.order)
              .map((value, i) => ({
                no: String(i + 1).padStart(2, '0'),
                title: value.title,
                text: value.description,
              }))}
          />
        </Block>

        <Block kicker="MILESTONES" title="发展历程">
          <Timeline
            nodes={timeline.map((node) => ({
              year: node.year,
              title: node.title,
              text: node.description,
              isNow: node.status === 'current',
            }))}
          />
        </Block>
      </div>

      <aside className="about-aside" aria-label="公司概况">
        <span className="aa-kicker">VITALS</span>
        <dl className="aa-grid">
          <div className="aa-cell">
            <dt>成立</dt>
            <dd>2021</dd>
          </div>
          <div className="aa-cell">
            <dt>团队</dt>
            <dd>06</dd>
          </div>
          <div className="aa-cell">
            <dt>交付</dt>
            <dd>40+</dd>
          </div>
          <div className="aa-cell">
            <dt>据点</dt>
            <dd>上海</dd>
          </div>
        </dl>
        <span className="aa-coord">31.23N&nbsp;121.47E</span>
        <span className="aa-rule" aria-hidden="true" />
        <p className="aa-note">
          设计与前端坐在一起工作，
          <br />
          没有「设计稿交付」那道墙。
        </p>
      </aside>
    </PageShell>
  );
}