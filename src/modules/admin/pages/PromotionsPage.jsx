import { useMemo, useState } from 'react';
import {
  Megaphone,
  Pencil,
  Plus,
  Save,
  TicketPercent,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';

import { FormField, FieldSelect } from '@/shared/components/Shared';
import { AdminHeading } from '@/modules/admin/pages/_AdminOperations';
import { useApp } from '@/shared/context/AppContext';
import {
  normalizePromoCode,
  normalizePromotions,
} from '@/shared/lib/promotions';

function newPromo() {
  return {
    id: crypto.randomUUID(),
    code: '',
    name: '',
    description: '',
    discountType: 'fixed',
    discountValue: 20,
    minimumSpend: 0,
    visibility: 'private',
    active: true,
  };
}

function promoValueLabel(promo) {
  return promo.discountType === 'percentage'
    ? `${Number(promo.discountValue || 0)}% off`
    : `$${Number(promo.discountValue || 0).toFixed(2)} off`;
}

export default function PromotionsPage() {
  const {
    promotions,
    updatePromotions,
  } = useApp();

  const [draft, setDraft] = useState(() =>
    normalizePromotions(structuredClone(promotions))
  );
  const [editing, setEditing] = useState(null);
  const [promoDraft, setPromoDraft] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const publicCodes = useMemo(
    () =>
      draft.promoCodes.filter(
        promo => promo.active && promo.visibility === 'public'
      ),
    [draft.promoCodes]
  );

  function saveAll(nextDraft = draft) {
    const normalized = normalizePromotions(nextDraft);

    if (
      normalized.announcement.enabled &&
      !normalized.promoCodes.some(
        promo =>
          promo.id === normalized.announcement.promoCodeId &&
          promo.active &&
          promo.visibility === 'public'
      )
    ) {
      return toast.error(
        'Choose an active public promo code before enabling the announcement bar.'
      );
    }

    updatePromotions(normalized);
    setDraft(normalized);
    toast.success('Promotion settings saved.');
  }

  function openPromo(promo = null) {
    setEditing(promo?.id || 'new');
    setPromoDraft(promo ? { ...promo } : newPromo());
  }

  function savePromo() {
    const code = normalizePromoCode(promoDraft.code);
    const discountValue = Number(promoDraft.discountValue);
    const minimumSpend = Number(promoDraft.minimumSpend || 0);

    if (code.length < 3) {
      return toast.error('Enter a promo code with at least 3 characters.');
    }

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return toast.error('Discount value must be greater than zero.');
    }

    if (
      promoDraft.discountType === 'percentage' &&
      discountValue > 100
    ) {
      return toast.error('Percentage discounts cannot be more than 100%.');
    }

    if (!Number.isFinite(minimumSpend) || minimumSpend < 0) {
      return toast.error('Minimum spend must be zero or more.');
    }

    const duplicate = draft.promoCodes.some(
      promo => promo.id !== promoDraft.id && normalizePromoCode(promo.code) === code
    );

    if (duplicate) {
      return toast.error('That promo code already exists.');
    }

    const saved = {
      ...promoDraft,
      code,
      name: promoDraft.name.trim() || code,
      description: promoDraft.description.trim(),
      discountValue,
      minimumSpend,
    };

    const nextCodes =
      editing === 'new'
        ? [saved, ...draft.promoCodes]
        : draft.promoCodes.map(promo =>
            promo.id === saved.id ? saved : promo
          );

    let nextAnnouncement = draft.announcement;

    if (
      nextAnnouncement.promoCodeId === saved.id &&
      (!saved.active || saved.visibility !== 'public')
    ) {
      nextAnnouncement = {
        ...nextAnnouncement,
        enabled: false,
      };
    }

    const next = {
      ...draft,
      promoCodes: nextCodes,
      announcement: nextAnnouncement,
    };

    setDraft(next);
    updatePromotions(next);
    setEditing(null);
    setPromoDraft(null);
    toast.success('Promo code saved.');
  }

  function deletePromo() {
    const nextCodes = draft.promoCodes.filter(
      promo => promo.id !== deleteId
    );

    const nextAnnouncement =
      draft.announcement.promoCodeId === deleteId
        ? {
            ...draft.announcement,
            enabled: false,
            promoCodeId: '',
          }
        : draft.announcement;

    const next = {
      ...draft,
      promoCodes: nextCodes,
      announcement: nextAnnouncement,
    };

    setDraft(next);
    updatePromotions(next);
    setDeleteId(null);
    toast.success('Promo code removed.');
  }

  function changeAnnouncement(key, value) {
    setDraft(previous => ({
      ...previous,
      announcement: {
        ...previous.announcement,
        [key]: value,
      },
    }));
  }

  return (
    <>
      <AdminHeading
        title="Promotions without developer changes."
        description="Create public or private promo codes and control the website announcement bar from one place."
      >
        <Button onClick={() => saveAll()}>
          <Save size={16} />
          Save promotions
        </Button>
      </AdminHeading>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <Card className="gap-0 overflow-hidden p-0 shadow-none">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b p-6">
            <div>
              <div className="mb-2 flex items-center gap-2 text-primary">
                <TicketPercent size={18} />
                <span className="text-xs font-bold uppercase tracking-[0.12em]">
                  Promo codes
                </span>
              </div>
              <h2 className="text-2xl">Public and private offers</h2>
              <p className="field-help mt-2 max-w-2xl">
                Public codes can be advertised on the website. Private codes still work in booking, but are not shown publicly.
              </p>
            </div>

            <Button onClick={() => openPromo()}>
              <Plus size={16} />
              Add promo code
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="pl-6">Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {draft.promoCodes.map(promo => (
                  <TableRow key={promo.id}>
                    <TableCell className="py-5 pl-6">
                      <p className="font-extrabold tracking-[0.05em] text-navy">
                        {promo.code}
                      </p>
                      <p className="field-help mt-1 max-w-[260px]">
                        {promo.name}
                      </p>
                    </TableCell>

                    <TableCell>
                      <p className="font-semibold">{promoValueLabel(promo)}</p>
                      <p className="field-help mt-1">
                        Min. ${Number(promo.minimumSpend || 0).toFixed(2)}
                      </p>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                          promo.visibility === 'public'
                            ? 'bg-secondary text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {promo.visibility === 'public' ? 'Public' : 'Private'}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                          promo.active
                            ? 'bg-[#eef8f2] text-[#32744b]'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {promo.active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>

                    <TableCell className="pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openPromo(promo)}
                        >
                          <Pencil size={14} />
                          Edit
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-[#993636] hover:text-[#993636]"
                          aria-label={`Delete ${promo.code}`}
                          onClick={() => setDeleteId(promo.id)}
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card className="p-6 shadow-none sm:p-7">
          <div className="mb-6 flex items-start gap-3">
            <div className="icon-square !h-10 !w-10">
              <Megaphone size={18} />
            </div>
            <div>
              <h2 className="text-2xl">Announcement bar</h2>
              <p className="field-help mt-2">
                Show one active public code in the thin bar above the website header.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
              <div>
                <Label htmlFor="announcement-enabled" className="font-semibold">
                  Show announcement bar
                </Label>
                <p className="field-help mt-1">
                  Turn the public promotion on or off instantly.
                </p>
              </div>
              <Switch
                id="announcement-enabled"
                checked={draft.announcement.enabled}
                onCheckedChange={value => changeAnnouncement('enabled', value)}
              />
            </div>

            <FormField
              id="announcement-message"
              label="Offer message"
              value={draft.announcement.message}
              placeholder="New to MateLink? Save $20 on your first clean"
              onChange={event => changeAnnouncement('message', event.target.value)}
            />

            <FieldSelect
              id="announcement-promo"
              label="Public promo code"
              value={draft.announcement.promoCodeId || ''}
              onChange={value => changeAnnouncement('promoCodeId', value)}
              placeholder="Choose a public promo code"
              options={publicCodes.map(promo => ({
                value: promo.id,
                label: `${promo.code} — ${promoValueLabel(promo)}`,
              }))}
            />

            {publicCodes.length === 0 && (
              <p className="field-error text-sm">
                Create an active public promo code before enabling the announcement bar.
              </p>
            )}

            <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
              <div>
                <Label htmlFor="announcement-book-now" className="font-semibold">
                  Show BOOK NOW link
                </Label>
                <p className="field-help mt-1">
                  Optional CTA that takes visitors into the booking journey.
                </p>
              </div>
              <Switch
                id="announcement-book-now"
                checked={draft.announcement.showBookNow}
                onCheckedChange={value => changeAnnouncement('showBookNow', value)}
              />
            </div>

            {draft.announcement.showBookNow && (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id="announcement-button-text"
                  label="Link text"
                  value={draft.announcement.buttonText}
                  onChange={event => changeAnnouncement('buttonText', event.target.value)}
                />

                <FormField
                  id="announcement-button-link"
                  label="Link path"
                  value={draft.announcement.buttonLink}
                  onChange={event => changeAnnouncement('buttonLink', event.target.value)}
                />
              </div>
            )}

            <div className="rounded-xl border bg-[#102d43] p-4 text-white">
              <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#a7dddb]">
                Preview
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-white/90">
                  {draft.announcement.message || 'Your offer message'}
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 font-extrabold tracking-[0.06em]">
                  {publicCodes.find(
                    promo => promo.id === draft.announcement.promoCodeId
                  )?.code || 'PROMO'}
                </span>
                {draft.announcement.showBookNow && (
                  <span className="font-bold text-[#a7dddb]">
                    {draft.announcement.buttonText || 'BOOK NOW'} →
                  </span>
                )}
              </div>
            </div>

            <Button className="w-full" onClick={() => saveAll()}>
              <Save size={16} />
              Save announcement
            </Button>
          </div>
        </Card>
      </div>

      <Dialog
        open={Boolean(editing)}
        onOpenChange={open => {
          if (!open) {
            setEditing(null);
            setPromoDraft(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing === 'new' ? 'Add promo code' : 'Edit promo code'}
            </DialogTitle>
            <DialogDescription>
              Public controls website visibility only. Both public and private active codes can be entered during booking.
            </DialogDescription>
          </DialogHeader>

          {promoDraft && (
            <div className="space-y-5 py-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id="promo-code"
                  label="Promo code"
                  value={promoDraft.code}
                  placeholder="WELCOME20"
                  onChange={event =>
                    setPromoDraft(previous => ({
                      ...previous,
                      code: event.target.value.toUpperCase(),
                    }))
                  }
                />

                <FormField
                  id="promo-name"
                  label="Internal name"
                  value={promoDraft.name}
                  placeholder="Welcome $20 Off"
                  onChange={event =>
                    setPromoDraft(previous => ({
                      ...previous,
                      name: event.target.value,
                    }))
                  }
                />
              </div>

              <FormField
                id="promo-description"
                label="Internal description"
                value={promoDraft.description}
                placeholder="Email campaign, website welcome offer, referral, etc."
                onChange={event =>
                  setPromoDraft(previous => ({
                    ...previous,
                    description: event.target.value,
                  }))
                }
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FieldSelect
                  id="promo-discount-type"
                  label="Discount type"
                  value={promoDraft.discountType}
                  onChange={value =>
                    setPromoDraft(previous => ({
                      ...previous,
                      discountType: value,
                    }))
                  }
                  options={[
                    { value: 'fixed', label: 'Fixed amount ($)' },
                    { value: 'percentage', label: 'Percentage (%)' },
                  ]}
                />

                <FormField
                  id="promo-discount-value"
                  label={
                    promoDraft.discountType === 'percentage'
                      ? 'Discount percentage'
                      : 'Discount amount (AUD)'
                  }
                  type="number"
                  min="0"
                  step="0.01"
                  value={promoDraft.discountValue}
                  onChange={event =>
                    setPromoDraft(previous => ({
                      ...previous,
                      discountValue: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id="promo-minimum-spend"
                  label="Minimum booking value (AUD)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={promoDraft.minimumSpend}
                  onChange={event =>
                    setPromoDraft(previous => ({
                      ...previous,
                      minimumSpend: event.target.value,
                    }))
                  }
                />

                <FieldSelect
                  id="promo-visibility"
                  label="Visibility"
                  value={promoDraft.visibility}
                  onChange={value =>
                    setPromoDraft(previous => ({
                      ...previous,
                      visibility: value,
                    }))
                  }
                  options={[
                    { value: 'public', label: 'Public — can be advertised' },
                    { value: 'private', label: 'Private — campaign only' },
                  ]}
                />
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
                <div>
                  <Label htmlFor="promo-active" className="font-semibold">
                    Active code
                  </Label>
                  <p className="field-help mt-1">
                    Inactive codes are rejected during booking.
                  </p>
                </div>
                <Switch
                  id="promo-active"
                  checked={promoDraft.active}
                  onCheckedChange={value =>
                    setPromoDraft(previous => ({
                      ...previous,
                      active: value,
                    }))
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditing(null);
                setPromoDraft(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={savePromo}>Save promo code</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteId)}
        onOpenChange={open => {
          if (!open) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this promo code?</AlertDialogTitle>
            <AlertDialogDescription>
              The code will stop being available in this frontend demo. If it is currently used by the announcement bar, the bar will also be disabled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={deletePromo}
            >
              Delete promo code
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
