import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, Mail, MessageSquare, ShieldCheck, Sparkles, ClipboardCheck, FileText, UploadCloud, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { PageIntro } from '@/modules/frontend/layouts/SiteLayout';
import { FormField, FieldSelect, PhotoUpload, SuccessState, EmptyState } from '@/shared/components/Shared';
import { isRecleanEligible, useApp } from '@/shared/context/AppContext';
import { services } from '@/shared/data/content';
import { validateContact } from '@/shared/lib/validation';
import { validPostcode } from '@/modules/booking/lib/pricing';
import { formatDate } from '@/shared/lib/dates';

export function QuotePage() {
  const { createQuote } = useApp();
  const [values,setValues] = useState({ service:'not-sure', property:'apartment', bedrooms:2, bathrooms:1, postcode:'', requirements:'', photos:[], customer:{name:'',email:'',mobile:'',address:''} });
  const [errors,setErrors] = useState({});
  const [consent,setConsent] = useState(false);
  const [result,setResult] = useState(null);
  const [busy,setBusy] = useState(false);
  const patch=part=>{setValues(previous=>({...previous,...part}));setErrors({});};
  const customer=(key,value)=>{setValues(previous=>({...previous,customer:{...previous.customer,[key]:value}}));setErrors(previous=>({...previous,[key]:undefined}));};
  function submit(event) {
    event.preventDefault();
    const found=validateContact(values.customer);
    if(!validPostcode(values.postcode)) found.postcode='Enter a four-digit Australian postcode.';
    if(values.requirements.trim().length<10) found.requirements='Please tell us a little more about what you need.';
    if(!consent) found.consent='Please acknowledge the privacy details.';
    setErrors(found);
    if(Object.keys(found).length || busy) return;
    setBusy(true);setResult(createQuote(values));
    window.scrollTo({top:0,behavior:'smooth'});
  }
  if(result) return <SuccessState eyebrow="Your tailored quote" title="Thanks for the details." description="Your quote request is saved in this preview. In the live website, Matelink will review your requirements and respond with a tailored quote." reference={result.reference}><div className="mt-7 flex flex-wrap justify-center gap-3"><Button asChild><Link to="/">Back to home</Link></Button><Button asChild variant="outline"><Link to="/admin/quotes">View in admin preview</Link></Button></div></SuccessState>;
  return <><PageIntro eyebrow="A clean as individual as your home" title="Tell us what you have in mind." description="Unusual property? A few extra requirements? Or simply not sure where to start? Let’s shape a quote around your space." /><section className="section-space"><div className="container-site grid items-start gap-10 lg:grid-cols-[1.4fr_.6fr]"><form className="surface p-6 sm:p-9" onSubmit={submit} noValidate><h2 className="mb-7 text-2xl">A little about your clean</h2><div className="grid gap-5 sm:grid-cols-2"><FieldSelect id="quote-service" label="Which service?" value={values.service} onChange={service=>patch({service})} options={[...services.map(s=>({label:s.name,value:s.id})),{label:'I’m not sure',value:'not-sure'}]}/><FormField id="quote-postcode" label="Postcode" inputMode="numeric" autoComplete="postal-code" maxLength={4} placeholder="e.g. 2000" value={values.postcode} onChange={e=>patch({postcode:e.target.value.replace(/\D/g,'').slice(0,4)})} error={errors.postcode}/><FieldSelect id="quote-property" label="Property type" value={values.property} onChange={property=>patch({property})} options={[{label:'Apartment',value:'apartment'},{label:'House',value:'house'},{label:'Townhouse',value:'townhouse'},{label:'Other',value:'other'}]}/><div className="grid grid-cols-2 gap-3"><FieldSelect id="quote-bedrooms" label="Bedrooms" value={String(values.bedrooms)} onChange={v=>patch({bedrooms:Number(v)})} options={Array.from({length:10},(_,i)=>({label:i===9?'9+':String(i),value:String(i)}))}/><FieldSelect id="quote-bathrooms" label="Bathrooms" value={String(values.bathrooms)} onChange={v=>patch({bathrooms:Number(v)})} options={Array.from({length:8},(_,i)=>({label:i===7?'8+':String(i+1),value:String(i+1)}))}/></div><FormField id="quote-address" label="Property address (optional)" className="sm:col-span-2" autoComplete="street-address" value={values.customer.address} onChange={e=>customer('address',e.target.value)}/><div className="sm:col-span-2"><Label htmlFor="quote-requirements" className="input-label mb-2 block">What would you like us to know?</Label><Textarea id="quote-requirements" className="min-h-36" placeholder="Tell us about the property, the clean you need and anything that needs extra care…" value={values.requirements} onChange={e=>patch({requirements:e.target.value})} maxLength={4000} aria-invalid={!!errors.requirements}/>{errors.requirements&&<p className="field-error mt-2">{errors.requirements}</p>}</div><div className="sm:col-span-2"><PhotoUpload photos={values.photos} onChange={photos=>patch({photos})} id="quote-photos"/></div></div><h2 className="mb-6 mt-9 border-t pt-8 text-2xl">Where can we reach you?</h2><div className="grid gap-5 sm:grid-cols-2"><FormField id="quote-name" label="Full name" autoComplete="name" value={values.customer.name} onChange={e=>customer('name',e.target.value)} error={errors.name}/><FormField id="quote-mobile" label="Mobile number" type="tel" autoComplete="tel" value={values.customer.mobile} onChange={e=>customer('mobile',e.target.value)} error={errors.mobile}/><FormField id="quote-email" label="Email address" type="email" autoComplete="email" className="sm:col-span-2" value={values.customer.email} onChange={e=>customer('email',e.target.value)} error={errors.email}/></div><div className="mt-6 flex items-start gap-3"><Checkbox id="quote-consent" className="mt-1" checked={consent} onCheckedChange={value=>setConsent(value===true)}/><Label className="block text-sm font-normal leading-relaxed" htmlFor="quote-consent">I acknowledge the <Link className="text-primary underline" to="/privacy" target="_blank">privacy details</Link> and understand Matelink will review this enquiry.</Label></div>{errors.consent&&<p className="field-error mt-2">{errors.consent}</p>}<Button type="submit" className="mt-7 h-12 w-full sm:w-auto sm:px-8" disabled={busy}>{busy?'Saving request…':'Request my quote'}</Button></form><aside className="rounded-2xl bg-secondary p-8"><div className="icon-square !bg-white"><MessageSquare size={24}/></div><h2 className="mt-6 text-2xl">A little more flexibility.</h2><p className="body-copy mt-5 text-sm">Share the details once. We’ll use them to understand your requirements and put together the right scope.</p><div className="mt-7 space-y-5 text-sm"><p className="flex gap-3"><ClipboardCheck className="shrink-0 text-primary" size={19}/>A quote tailored to your property</p><p className="flex gap-3"><ShieldCheck className="shrink-0 text-primary" size={19}/>No payment to submit an enquiry</p><p className="flex gap-3"><Sparkles className="shrink-0 text-primary" size={19}/>Your details carry into an accepted booking</p></div><div className="mt-8 border-t border-primary/20 pt-6"><p className="text-sm font-semibold">Know exactly what you need?</p><Link to="/book" className="link-line mt-3">Request a standard clean</Link></div></aside></div></section></>;
}

export function ContactPage() {
  const { settings, addContact } = useApp();
  const [values,setValues]=useState({name:'',email:'',mobile:'',message:''});
  const [errors,setErrors]=useState({});
  const [sent,setSent]=useState(false);
  function patch(key,value) {setValues(previous=>({...previous,[key]:value}));setErrors(previous=>({...previous,[key]:undefined}));}
  function submit(event) {event.preventDefault();const found=validateContact(values,{mobile:false});if(values.message.trim().length<10)found.message='Please tell us a little more about your enquiry.';setErrors(found);if(Object.keys(found).length)return;addContact(values);setSent(true);window.scrollTo({top:0,behavior:'smooth'});}
  if(sent) return <SuccessState eyebrow="Let’s stay in touch" title="Your message is saved." description="Thanks for sharing the details. This preview keeps your enquiry in the admin area; no email has been sent."><Button asChild className="mt-7"><Link to="/">Back to home</Link></Button></SuccessState>;
  return <><PageIntro eyebrow="We’re here to help" title="Let’s talk about your home." description="A question about your clean, your booking or something a little different? Send us a message."/><section className="section-space"><div className="container-site grid gap-12 md:grid-cols-[.8fr_1.2fr]"><div><div className="icon-square mb-6"><MessageSquare size={25}/></div><h2 className="text-3xl">A conversation<br/>is a good place to start.</h2><p className="body-copy mt-6">For a cleaning price, use our booking journey or quote form. For everything else, leave the details here.</p><p className="mt-7 flex items-center gap-3 text-sm"><MapPin size={20} className="text-primary"/>Sydney, Australia</p>{settings.contactEmail&&<a className="mt-5 flex items-center gap-3 break-all text-sm" href={`mailto:${settings.contactEmail}`}><Mail size={20} className="text-primary"/>{settings.contactEmail}</a>}<div className="mt-8 flex flex-wrap gap-3"><Button asChild><Link to="/book">Book now</Link></Button><Button variant="outline" asChild><Link to="/get-a-quote">Get a quote</Link></Button></div></div><form onSubmit={submit} className="surface p-6 sm:p-9" noValidate><div className="grid gap-5 sm:grid-cols-2"><FormField id="contact-name" label="Full name" autoComplete="name" value={values.name} onChange={e=>patch('name',e.target.value)} error={errors.name}/><FormField id="contact-mobile" label="Mobile (optional)" type="tel" autoComplete="tel" value={values.mobile} onChange={e=>patch('mobile',e.target.value)} error={errors.mobile}/><FormField id="contact-email" label="Email address" type="email" autoComplete="email" className="sm:col-span-2" value={values.email} onChange={e=>patch('email',e.target.value)} error={errors.email}/><div className="sm:col-span-2"><Label className="input-label mb-2 block" htmlFor="contact-message">Your message</Label><Textarea id="contact-message" className="min-h-40" value={values.message} onChange={e=>patch('message',e.target.value)} maxLength={4000} placeholder="How can we help?" aria-invalid={!!errors.message}/>{errors.message&&<p className="field-error mt-2">{errors.message}</p>}</div></div><p className="field-help mt-5">Submitting acknowledges the <Link className="text-primary underline" to="/privacy" target="_blank">privacy details</Link>.</p><Button className="mt-6 h-12 px-7" type="submit">Send message</Button></form></div></section></>;
}


const inspectionReportTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

async function prepareInspectionReport(file) {
  if (!file) return null;

  if (!inspectionReportTypes.includes(file.type)) {
    throw new Error(
      'Choose a PDF, JPG, PNG or WebP inspection report.'
    );
  }

  // This is a static browser preview using localStorage.
  // Keep the file deliberately small until the Laravel upload API is connected.
  if (file.size > 2 * 1024 * 1024) {
    throw new Error(
      'For this preview, the inspection report must be smaller than 2 MB.'
    );
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        data: reader.result,
      });
    };

    reader.onerror = () => {
      reject(
        new Error('The inspection report could not be read.')
      );
    };

    reader.readAsDataURL(file);
  });
}

function InspectionReportUpload({
  value,
  onChange,
  error,
}) {
  const [loading, setLoading] = useState(false);

  async function handleFile(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setLoading(true);

    try {
      onChange(await prepareInspectionReport(file));
    } catch (uploadError) {
      onChange(null);
      toast.error(uploadError.message);
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  }

  return (
    <div>
      <Label
        htmlFor="reclean-inspection-report"
        className="input-label mb-2 block"
      >
        Upload Inspection Report *
      </Label>

      {!value ? (
        <div
          className={`photo-upload ${
            error ? 'border-[#d98b8b]' : ''
          }`}
        >
          <UploadCloud
            className="mx-auto mb-3 text-primary"
            size={26}
          />

          <p className="text-sm font-semibold">
            {loading
              ? 'Preparing your report…'
              : 'Upload the agent or property manager inspection report'}
          </p>

          <p className="field-help mt-2">
            PDF, JPG, PNG or WebP · 2 MB maximum in this static preview
          </p>

          <Label
            htmlFor="reclean-inspection-report"
            className="mt-4 inline-flex cursor-pointer rounded-lg border bg-white px-4 py-2 text-sm font-semibold"
          >
            Choose report
          </Label>

          <input
            id="reclean-inspection-report"
            className="sr-only"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
            onChange={handleFile}
            disabled={loading}
          />
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="icon-square !h-10 !w-10">
              <FileText size={19} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {value.name}
              </p>

              <p className="field-help mt-1">
                {(value.size / 1024).toFixed(0)} KB
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange(null)}
          >
            <X size={14} />
            Remove
          </Button>
        </div>
      )}

      {error && (
        <p className="field-error mt-2">
          {error}
        </p>
      )}
    </div>
  );
}

function BookingPrefillCard({ booking }) {
  const service = services.find(
    item => item.id === booking.service
  );

  const rows = [
    ['Booking reference', booking.reference],
    ['Service', service?.name || 'End-of-Lease Cleaning'],
    ['Customer', booking.customer.name],
    ['Email', booking.customer.email],
    ['Mobile', booking.customer.mobile],
    [
      'Property',
      booking.customer.address
        ? `${booking.customer.address} · ${booking.postcode}`
        : `Postcode ${booking.postcode}`,
    ],
    ['Clean date', formatDate(booking.date)],
  ];

  return (
    <div className="mb-8 rounded-2xl border bg-[#faf9f6] p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
            Original booking
          </p>

          <h2 className="mt-2 text-xl">
            Your booking details are already filled in.
          </h2>
        </div>

        <span className="status-pill">
          Bond Back Guarantee eligible
        </span>
      </div>

      <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {label}
            </p>

            <p className="mt-1 break-words text-sm">
              {value || 'Not supplied'}
            </p>
          </div>
        ))}
      </div>

      <p className="field-help mt-5 border-t pt-4">
        You do not need to enter these details again. The re-clean request
        remains linked to this original booking.
      </p>
    </div>
  );
}

export function RecleanPage() {
  const { token } = useParams();

  const {
    bookings,
    requestReclean,
  } = useApp();

  const booking = bookings.find(
    item => item.token === token
  );

  const [values, setValues] = useState({
    agentName: '',
    agentFeedback: '',
    explanation: '',
    inspectionReport: null,
    photos: [],
  });

  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const patch = part => {
    setValues(previous => ({
      ...previous,
      ...part,
    }));

    setErrors(previous => {
      const next = { ...previous };

      Object.keys(part).forEach(key => {
        delete next[key];
      });

      return next;
    });
  };

  function submit(event) {
    event.preventDefault();

    const found = {};

    if (!values.agentName.trim()) {
      found.agentName =
        'Please enter the agent or property manager name.';
    }

    if (values.explanation.trim().length < 10) {
      found.explanation =
        'Please briefly explain the cleaning issue.';
    }

    if (!values.inspectionReport) {
      found.inspectionReport =
        'Please upload the inspection report.';
    }

    if (!values.photos.length) {
      found.photos =
        'Please upload at least one photo of the issue.';
    }

    setErrors(found);

    if (Object.keys(found).length) {
      return;
    }

    const request = requestReclean(
      booking.id,
      values
    );

    if (!request) {
      setErrors({
        eligibility:
          'This booking is not currently eligible for a Bond Back Guarantee re-clean.',
      });

      return;
    }

    setSent(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  if (!booking || !isRecleanEligible(booking)) {
    return (
      <div className="container-site py-16">
        <EmptyState
          icon={ShieldCheck}
          title="This booking is not eligible for a re-clean request."
          description="Re-clean requests are only available for completed End-of-Lease Cleaning bookings that are eligible under the Bond Back Guarantee."
        >
          <Button asChild>
            <Link
              to={
                booking
                  ? `/booking/${token}`
                  : '/bond-back-guarantee'
              }
            >
              {booking
                ? 'View booking'
                : 'About the guarantee'}
            </Link>
          </Button>
        </EmptyState>
      </div>
    );
  }

  if (sent) {
    return (
      <SuccessState
        eyebrow="Connected to your original clean"
        title="Your re-clean request is saved."
        description="Matelink will review the inspection report, photos and agreed cleaning scope before confirming the next step. Your original booking remains linked to this request."
        reference={booking.reference}
      >
        <Button asChild className="mt-7">
          <Link to={`/booking/${token}`}>
            Back to my booking
          </Link>
        </Button>
      </SuccessState>
    );
  }

  return (
    <>
      <PageIntro
        eyebrow={`Original booking · ${booking.reference}`}
        title="End-of-Lease Re-clean Request"
        description="For eligible Bond Back Guarantee concerns, share the property manager details and evidence below. Your original booking information is carried into the request automatically."
      />

      <section className="section-space">
        <div className="container-site max-w-[900px]">
          <form
            className="surface p-6 sm:p-9"
            onSubmit={submit}
            noValidate
          >
            <BookingPrefillCard booking={booking} />

            <div className="mb-8 rounded-xl bg-secondary p-5 text-sm">
              Approval depends on the agreed cleaning scope and Matelink’s{' '}
              <Link
                className="font-semibold underline"
                to="/bond-back-guarantee"
              >
                Bond Back Guarantee terms
              </Link>
              .
            </div>

            {errors.eligibility && (
              <p className="field-error mb-6 rounded-lg border border-[#efd1d1] bg-[#fff6f6] p-4">
                {errors.eligibility}
              </p>
            )}

            <FormField
              id="reclean-agent"
              label="Agent or Property Manager Name *"
              value={values.agentName}
              onChange={event =>
                patch({
                  agentName: event.target.value,
                })
              }
              error={errors.agentName}
              autoComplete="name"
              maxLength={180}
            />

            <div className="mt-5">
              <Label
                htmlFor="reclean-feedback"
                className="input-label mb-2 block"
              >
                Agent / Property Manager Feedback
                <span className="font-normal text-muted-foreground">
                  {' '}(optional)
                </span>
              </Label>

              <Textarea
                id="reclean-feedback"
                className="min-h-32"
                value={values.agentFeedback}
                onChange={event =>
                  patch({
                    agentFeedback: event.target.value,
                  })
                }
                maxLength={4000}
                placeholder="Paste or summarise the feedback from the agent or property manager, if provided."
              />
            </div>

            <div className="mt-5">
              <Label
                htmlFor="reclean-explanation"
                className="input-label mb-2 block"
              >
                Short Explanation of the Issue *
              </Label>

              <Textarea
                id="reclean-explanation"
                className="min-h-28"
                value={values.explanation}
                onChange={event =>
                  patch({
                    explanation: event.target.value,
                  })
                }
                maxLength={3000}
                aria-invalid={!!errors.explanation}
                placeholder="Briefly explain which cleaning issue needs to be reviewed."
              />

              {errors.explanation && (
                <p className="field-error mt-2">
                  {errors.explanation}
                </p>
              )}
            </div>

            <div className="mt-6">
              <InspectionReportUpload
                value={values.inspectionReport}
                onChange={inspectionReport =>
                  patch({ inspectionReport })
                }
                error={errors.inspectionReport}
              />
            </div>

            <div className="mt-6">
              <PhotoUpload
                id="reclean-photos"
                label="Photos of the Issue *"
                optional={false}
                helper="Upload 1–4 clear photos showing the cleaning concern · JPG, PNG or WebP"
                prompt="Upload clear photos showing the cleaning concern"
                photos={values.photos}
                onChange={photos =>
                  patch({ photos })
                }
                error={errors.photos}
              />
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                className="h-12 px-6"
                type="submit"
              >
                Submit Re-clean Request
              </Button>

              <Button
                className="h-12"
                variant="outline"
                asChild
              >
                <Link to={`/booking/${token}`}>
                  Back to booking
                </Link>
              </Button>
            </div>

            <p className="field-help mt-5">
              Static preview: this request is saved in this browser only.
              Laravel/API upload handling will replace browser storage later.
            </p>
          </form>
        </div>
      </section>
    </>
  );
}
