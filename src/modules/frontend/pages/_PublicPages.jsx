import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Check, Sparkles, House, KeyRound, ShieldCheck, CalendarDays, ClipboardCheck, MapPin, MoveUpRight, CircleHelp, Heart, Leaf, HandHeart } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Card, CardContent } from '@/shared/components/ui/card';
import { CTABand, FeatureStrip, PageIntro, PostcodeCheck } from '@/modules/frontend/layouts/SiteLayout';
import { CheckList, FAQList } from '@/shared/components/Shared';
import { services, faqs, inclusionRows } from '@/shared/data/content';
import { isRecleanEligible, useApp } from '@/shared/context/AppContext';
import { availableAddons } from '@/modules/booking/lib/pricing';

const serviceIcons = { general: House, deep: Sparkles, 'move-in': House, 'end-of-lease': KeyRound };

export function HomePage() {
  return <>
    <section className="container-site hero-grid">
      <div className="hero-copy"><h1 className="hero-title">Sydney Home Cleaning</h1><p className="body-copy max-w-[470px]">From a much-needed refresh to a brand-new beginning, we help you care for the place you call home.</p><PostcodeCheck /><p className="mt-5 text-sm text-muted-foreground">Something a little different? <Link className="font-semibold text-navy underline underline-offset-4" to="/get-a-quote">Get a tailored quote</Link></p></div>
      <div className="hero-image-wrap"><img src="/images/hero.webp" width="1900" height="1267" fetchPriority="high" alt="Light-filled living room with neutral sofas, timber furniture and indoor plants" /><div className="hero-image-tag"><div className="icon-square !h-11 !w-11"><Sparkles size={22} /></div><div><p className="text-sm font-semibold">For all of life’s fresh starts.</p><p className="mt-1 text-xs text-muted-foreground">Deep clean · Move in · Move out</p></div></div></div>
    </section>
    <FeatureStrip />
    <section className="section-space "><div className="container-site"><div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow mb-4">One home. Different moments.</p><h2 className="section-heading">The right clean,<br />right when you need it.</h2></div><p className="body-copy max-w-[360px] text-sm">Three considered services. One simple way to make your space feel good again.</p></div><div className="grid gap-6 md:grid-cols-3">{services.map(service => <article className="service-card overflow-hidden rounded-2xl bg-white" key={service.id}><Link to={`/${service.slug}`} tabIndex={-1} aria-hidden="true" className="block overflow-hidden"><img className="service-card-image" loading="lazy" src={service.image} width="1600" height="1067" alt={service.imageAlt} /></Link><div className="p-7"><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">{service.eyebrow}</p><h3 className="text-2xl">{service.name}</h3><p className="body-copy mt-4 text-sm">{service.cardText}</p><Link className="link-line mt-6" to={`/${service.slug}`}>Explore {service.name.toLowerCase()}</Link></div></article>)}</div></div></section>
    <section className="section-space"><div className="container-site"><div className="mb-12"><p className="eyebrow mb-4">Less effort. More ease.</p><h2 className="section-heading">A fresh start in three steps.</h2></div><div className="process-grid">{[
      ['01','Make it your clean','Choose your service, tell us about your home and add the extras you need.'],
      ['02','Pick your preferred date','Send your request without paying upfront. We’ll review the details and confirm your clean personally.'],
      ['03','Enjoy your space','We take care of the agreed clean. Your payment options stay available after the service.'],
    ].map(([number,title,description])=><article key={number}><div className="process-number">{number}</div><h3 className="mb-4 text-xl">{title}</h3><p className="body-copy text-sm">{description}</p></article>)}</div></div></section>
    <section className="section-space "><div className="container-site editorial-grid"><div className="service-photo !h-[460px]"><img src="/images/about.webp" width="1267" height="1900" loading="lazy" alt="Calm modern living room with timber furniture and soft curtains" /></div><div><p className="eyebrow mb-5">A thoughtful approach</p><h2 className="section-heading">Good cleaning starts<br />with understanding<br />your home.</h2><p className="body-copy mt-6">Every space is a little different. That’s why you choose the service and extras, and we confirm the details with you before your clean.</p><CheckList items={['Clear inclusions and considered extras','A simple request, with no customer account','Personal confirmation before we arrive']} /><Link className="link-line mt-7" to="/about">A little more about Matelink</Link></div></div></section>
    <section className="section-space"><div className="container-site grid gap-12 md:grid-cols-[.85fr_1.15fr]"><div><p className="eyebrow mb-5">Good to know</p><h2 className="section-heading">A few questions,<br />taken care of.</h2><p className="body-copy mt-5 text-sm">The details that make your next clean a little easier.</p><Link className="link-line mt-5" to="/faq">All your questions, answered</Link></div><FAQList items={faqs.slice(0,5)} /></div></section>
    <CTABand />
  </>;
}

export function ServicePage({ serviceId }) {
  const service = services.find(s => s.id === serviceId);
  const navigate = useNavigate();
  const { settings } = useApp();
  const extras = availableAddons(settings, serviceId);
  return <>
    <section className="container-site pt-8"><Tabs value={serviceId} onValueChange={value => navigate(`/${services.find(s=>s.id===value).slug}`)}><TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl  p-1 md:w-auto">{services.map(s => <TabsTrigger className="min-h-11 whitespace-nowrap px-3 text-xs sm:px-5 sm:text-sm" key={s.id} value={s.id}>{s.name}</TabsTrigger>)}</TabsList></Tabs></section>
    <section className="container-site hero-grid !gap-12 !pb-16 !pt-8"><div><p className="eyebrow">{service.eyebrow}</p><h1 className="hero-title whitespace-pre-line !text-[clamp(2.7rem,4.4vw,4.4rem)]">{service.title}</h1><p className="body-copy max-w-xl">{service.summary}</p><div className="mt-7 flex flex-wrap gap-3"><Button className="h-12 px-6" asChild><Link to={`/book?service=${serviceId}`}>Request this clean</Link></Button><Button variant="outline" className="h-12 px-6" asChild><Link to="/get-a-quote">Get a tailored quote</Link></Button></div><p className="field-help mt-5 flex items-center gap-2"><ShieldCheck size={16} />No payment at the request stage.</p></div><div className="service-photo"><img src={service.image} width="1600" height="1067" alt={service.imageAlt} fetchPriority="high" /></div></section>
    <section className="section-space "><div className="container-site grid gap-12 md:grid-cols-[.9fr_1.1fr]"><div><p className="eyebrow mb-5">The details make the difference</p><h2 className="section-heading">Care for the spaces<br />that matter.</h2><p className="body-copy mt-5">A clear cleaning scope, with room for the little extras your home needs.</p><Link className="link-line mt-6" to="/whats-included">See what’s included</Link></div><Card className="border-0 bg-white p-8 shadow-none sm:p-10"><CardContent className="p-0"><div className="mb-7 flex items-center gap-4"><div className="icon-square">{(() => { const Icon = serviceIcons[serviceId]; return <Icon size={23} />; })()}</div><h3 className="text-2xl">Your {service.short}</h3></div><CheckList items={service.includes} /><p className="field-help mt-7 border-t pt-5">Suggested scope for review. Your confirmation sets out the agreed inclusions for your property.</p></CardContent></Card></div></section>
    <section className="section-space"><div className="container-site"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="eyebrow mb-4">Make it yours</p><h2 className="section-heading">A little extra, where you need it.</h2></div><p className="body-copy max-w-md text-sm">{serviceId === 'deep' ? 'Tell us about any special requirements. We can review extras as part of a tailored quote.' : 'Add carpets, windows, outdoor areas and more when you request your clean.'}</p></div>{extras.length>0 ? <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{extras.map(extra=><div key={extra.id} className="flex items-center gap-3 rounded-xl border p-5 text-sm font-semibold"><Check size={17} className="text-primary" />{extra.name}</div>)}</div> : <div className="mt-8 rounded-xl border p-7"><p className="body-copy">Need something extra? Share your requirements and optional photos with us.</p><Button asChild variant="outline" className="mt-4"><Link to="/get-a-quote">Tell us what you need</Link></Button></div>}</div></section>
    {serviceId === 'end-of-lease' && (
      <section className="container-site mb-20" id="bond-back-guarantee">
        <div className="overflow-hidden rounded-2xl border border-primary/15 bg-secondary">
          <div className="grid gap-0 lg:grid-cols-[1fr_.48fr]">
            <div className="p-8 sm:p-12">
              <div className="icon-square mb-6 !h-12 !w-12 bg-white">
                <ShieldCheck size={25} />
              </div>

              <p className="eyebrow mb-4">Bond Back Guarantee</p>

              <h2 className="max-w-2xl text-3xl sm:text-4xl">
                Extra reassurance after your End-of-Lease clean.
              </h2>

              <p className="body-copy mt-5 max-w-2xl">
                Eligible cleaning concerns within the agreed End-of-Lease scope can be reviewed under Matelink’s Bond Back Guarantee. If your agent or property manager identifies an eligible cleaning issue after your completed clean, you can submit a re-clean request against the original booking.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild className="h-11 px-5">
                  <Link to="/bond-back-guarantee">
                    View Bond Back Guarantee
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-11 bg-white px-5">
                  <Link to="/bond-back-guarantee#request-reclean">
                    Request a Re-clean
                  </Link>
                </Button>
              </div>

              <p className="field-help mt-5 max-w-2xl">
                Re-clean requests are only available for eligible, completed End-of-Lease Cleaning bookings covered by the Bond Back Guarantee.
              </p>
            </div>

            <div className="border-t border-primary/15 bg-white/70 p-8 lg:border-l lg:border-t-0 sm:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                Already completed your clean?
              </p>

              <h3 className="mt-4 text-2xl">
                Keep the request connected to your booking.
              </h3>

              <p className="body-copy mt-4 text-sm">
                Use the secure link for your original completed End-of-Lease booking. Your booking details stay attached to the request, so you do not need to start again.
              </p>

              <Link className="link-line mt-6" to="/bond-back-guarantee#request-reclean">
                See how to request a re-clean
              </Link>
            </div>
          </div>
        </div>
      </section>
    )}
    <CTABand title="Let’s make your next clean simple." />
  </>;
}

export function IncludedPage() {
  const displayCell = value => value === true ? <Check className="mx-auto text-primary" size={20} aria-label="Included in suggested scope" /> : value === 'extra' ? <span className="text-xs text-primary">Optional extra</span> : value === 'quote' ? <span className="text-xs text-muted-foreground">Ask for a quote</span> : <span className="text-muted-foreground" aria-label="Not included">—</span>;
  return <><PageIntro eyebrow="The details, made clear" title="Know what goes into your clean." description="Compare the three services and find the scope that fits your home. Your confirmed booking will set out the final agreed inclusions." /><section className="section-space"><div className="container-site"><div className="mb-6 rounded-xl bg-secondary px-6 py-4 text-sm">This is a suggested scope for Matelink’s approval. Optional extras are charged separately once pricing is agreed.</div><div className="surface overflow-hidden"><Table><TableHeader><TableRow className=""><TableHead className="min-w-[290px] p-6">Cleaning area</TableHead><TableHead className="min-w-[140px] text-center">Deep Cleaning</TableHead><TableHead className="min-w-[140px] text-center">Move-In</TableHead><TableHead className="min-w-[150px] text-center">End-of-Lease</TableHead></TableRow></TableHeader><TableBody>{inclusionRows.map((row,index)=><TableRow key={index}><TableCell className="whitespace-normal px-6 py-5"><p className="mb-1 text-xs font-bold uppercase tracking-wide text-primary">{row.area}</p><p className="text-sm">{row.task}</p></TableCell><TableCell className="text-center">{displayCell(row.deep)}</TableCell><TableCell className="text-center">{displayCell(row.move)}</TableCell><TableCell className="text-center">{displayCell(row.lease)}</TableCell></TableRow>)}</TableBody></Table></div><div className="mt-8 grid gap-6 md:grid-cols-2"><div className="surface p-7"><h3 className="mb-4 text-xl">Help us prepare</h3><p className="body-copy text-sm">Tell us about access, parking, property condition and any areas needing particular care when you send your request.</p></div><div className="surface p-7"><h3 className="mb-4 text-xl">Something outside this scope?</h3><p className="body-copy text-sm">Share your requirements through our quote form so we can confirm a suitable scope before the job.</p><Link className="link-line mt-4" to="/get-a-quote">Get a tailored quote</Link></div></div></div></section><CTABand /></>;
}

export function AboutPage() {
  return <><section className="container-site editorial-grid py-16"><div><p className="eyebrow mb-6">Hello, we’re Matelink</p><h1 className="page-title">Care for the place<br />you call home.</h1><p className="body-copy mt-7">A home is more than a set of rooms. It’s where your routines happen, your next chapter starts and life unfolds.</p><p className="body-copy mt-5">Matelink’s approach is simple: make it easy to choose the right clean, understand the scope and arrange the details. From everyday refreshes to moving days, we keep your home at the heart of the conversation.</p><Button asChild className="mt-7 h-12 px-6"><Link to="/book">Find your clean</Link></Button></div><div className="service-photo !h-[620px]"><img src="/images/about.webp" width="1267" height="1900" alt="Quiet contemporary living room with soft natural light" fetchPriority="high" /></div></section><section className="section-space "><div className="container-site"><p className="eyebrow mb-5">How we approach it</p><h2 className="section-heading mb-10">Thoughtful at every step.</h2><div className="grid gap-8 md:grid-cols-3">{[[HandHeart,'Your home comes first','Choose a service and extras that fit your space. Tell us about the details that matter to you.'],[ClipboardCheck,'Clarity feels good','Understand your cleaning scope and price before your request is confirmed.'],[CalendarDays,'Keep things simple','Request your preferred date, hear from us personally and view your booking without an account.']].map(([Icon,title,text])=><article className="surface p-8" key={title}><div className="icon-square mb-6"><Icon size={24}/></div><h3 className="mb-4 text-xl">{title}</h3><p className="body-copy text-sm">{text}</p></article>)}</div></div></section><div className="mt-20"><CTABand /></div></>;
}

export function GuaranteePage() {
  const location = useLocation();
  const { bookings } = useApp();

  const eligibleBooking = bookings.find(
    isRecleanEligible
  );

  useEffect(() => {
    if (location.hash !== '#request-reclean') return;

    const timer = window.setTimeout(() => {
      document
        .getElementById('request-reclean')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [location.hash]);

  return (
    <>
      <PageIntro
        eyebrow="For a considered handover"
        title="Our Bond Back Guarantee."
        description="A straightforward way to raise eligible cleaning concerns after an End-of-Lease clean, linked to your original booking."
      />

      <section className="section-space">
        <div className="container-site grid gap-12 md:grid-cols-[1.15fr_.85fr]">
          <div>
            <div className="icon-square mb-6">
              <ShieldCheck size={25} />
            </div>

            <h2 className="mb-6 text-3xl">
              Reassurance, with a clear scope.
            </h2>

            <p className="body-copy">
              The guarantee applies to eligible cleaning issues within
              the scope agreed for your End-of-Lease booking and is
              subject to Matelink’s terms. Matelink reviews each
              request before approving a re-clean.
            </p>

            <p className="body-copy mt-5">
              A rental bond can depend on matters beyond cleaning.
              This guarantee does not promise a full bond refund or
              cover issues outside the agreed cleaning scope.
            </p>

            <h3 className="mb-4 mt-9 text-xl">
              If your agent raises a concern
            </h3>

            <CheckList
              items={[
                'Open the secure link for your original completed End-of-Lease booking.',
                'Choose “Request a Re-clean”.',
                'Add the agent or property manager name, a short explanation, the inspection report and photos of the issue.',
                'Matelink reviews your request and confirms the next steps.',
              ]}
            />

            <p className="field-help mt-7">
              Matelink’s final eligibility conditions and request
              timeframe must be approved before launch. No deadline
              has been assumed in this preview.
            </p>
          </div>

          <div
            id="request-reclean"
            className="surface self-start scroll-mt-32 border-primary/15 bg-[#faf9f6] p-8"
          >
            <p className="eyebrow mb-4">
              Request a Re-clean
            </p>

            <h3 className="text-2xl">
              Already had your End-of-Lease clean?
            </h3>

            <p className="body-copy mt-4 text-sm">
              Re-clean requests are only available for eligible,
              completed End-of-Lease Cleaning bookings covered by the
              Bond Back Guarantee.
            </p>

            <p className="body-copy mt-4 text-sm">
              Open your original booking and submit the request from
              there. Your customer, property and booking details stay
              linked automatically.
            </p>

            <div className="mt-6 rounded-xl border bg-white p-5">
              <p className="text-sm font-semibold text-foreground">
                You’ll be asked for:
              </p>

              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>• Agent or Property Manager Name</li>
                <li>• Agent / Property Manager Feedback (optional)</li>
                <li>• Short Explanation of the Issue</li>
                <li>• Inspection Report</li>
                <li>• Photos of the Issue</li>
              </ul>
            </div>

            {eligibleBooking ? (
              <div className="mt-6 flex flex-col gap-3">
                <Button asChild className="h-11">
                  <Link
                    to={`/booking/${eligibleBooking.token}/re-clean`}
                  >
                    Request a Re-clean
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="h-11 bg-white"
                >
                  <Link
                    to={`/booking/${eligibleBooking.token}`}
                  >
                    View eligible booking
                  </Link>
                </Button>

                {eligibleBooking.demo && (
                  <p className="field-help">
                    Static preview: this button uses the included
                    sample completed End-of-Lease booking.
                  </p>
                )}
              </div>
            ) : (
              <Button
                asChild
                className="mt-6 h-11"
              >
                <Link to="/login">
                  Sign in to view my booking
                </Link>
              </Button>
            )}

            <Link
              className="link-line mt-6"
              to="/terms"
            >
              Read the draft terms
            </Link>
          </div>
        </div>
      </section>

      <CTABand
        title="Moving out? We’ll help you plan your clean."
      />
    </>
  );
}

export function FAQPage() {
  return <><PageIntro eyebrow="Good to know" title="A little clarity for your next clean." description="From your first request to your final payment, here are the details you might be wondering about." /><section className="section-space"><div className="container-site max-w-[920px]"><FAQList /><div className="mt-10 rounded-xl bg-secondary p-7"><h2 className="text-xl">Still have something on your mind?</h2><p className="body-copy mt-3 text-sm">Send us a message, or tell us about a job that needs a tailored quote.</p><div className="mt-5 flex flex-wrap gap-3"><Button asChild variant="outline"><Link to="/contact">Contact us</Link></Button><Button asChild><Link to="/get-a-quote">Get a quote</Link></Button></div></div></div></section></>;
}

export function PolicyPage({ type }) {
  const privacy = type === 'privacy';
  return <><PageIntro eyebrow="The finer details" title={privacy ? 'Privacy policy' : 'Terms & conditions'} description="Draft content for client review. Matelink’s approved policies must replace this page before launch." /><section className="section-space"><div className="container-site max-w-[860px]"><div className="mb-8 rounded-xl bg-secondary p-6 text-sm">This frontend preview does not define a legal policy. The business must supply or approve the final wording.</div>{(privacy ? [
    ['Information in a request','The forms collect contact details, property information, preferred dates and optional photos. The final policy should explain the business purposes and approved handling of this information.'],
    ['Storage and access','For this preview, form submissions remain in this browser. The production policy must describe hosting, retention, authorised access and any third-party email or payment providers.'],
    ['Your privacy enquiries','The final policy should provide Matelink’s approved contact details and process for privacy enquiries.'],
  ] : [
    ['Booking requests','Submitting a request does not confirm a booking. Matelink reviews the property, scope, price and preferred date before confirmation.'],
    ['Prices and payment','No payment is collected at the request stage. Confirmed booking totals remain fixed when pricing rules change. PayID and bank transfer funds require Matelink’s verification.'],
    ['Cleaning scope and access','The confirmed booking should state the agreed scope, exclusions and any access requirements. Detailed conditions must be provided by Matelink.'],
    ['Cancellations and changes','Notice periods, cancellation charges, refunds and rescheduling rules have not been supplied and must be approved before launch.'],
    ['Bond Back Guarantee','Eligible cleaning issues within the agreed End-of-Lease scope may be reviewed for a re-clean. Final eligibility and time limits must be supplied by Matelink.'],
  ]).map(([title,text])=><article className="mb-8" key={title}><h2 className="mb-4 text-2xl">{title}</h2><p className="body-copy">{text}</p></article>)}</div></section></>;
}

export function NotFoundPage() {
  return <div className="container-site py-24 text-center"><p className="eyebrow justify-center">404 · A little detour</p><h1 className="mt-7 text-4xl sm:text-5xl">This page has moved on.</h1><p className="body-copy mx-auto mt-6 max-w-lg">Let’s get you back to somewhere familiar.</p><Button asChild className="mt-8 h-12 px-6"><Link to="/">Back to home</Link></Button></div>;
}
