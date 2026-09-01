'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { CircleAlert, Wand2, Save } from 'lucide-react';
import { propertySchema, type PropertyInput } from '@/lib/validations/property';
import { checkPropertySlugAvailability, createProperty, updateProperty } from '@/actions/admin-properties';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label, FieldError } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { PROPERTY_TYPES } from '@/lib/utils/constants';
import { slugify } from '@/lib/utils/format';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import type { Amenity, Property } from '@/types/database';

const BOOLEAN_FIELDS: { key: keyof PropertyInput; label: string }[] = [
  { key: 'hasElevator', label: 'Ascenseur' },
  { key: 'hasBalcony', label: 'Balcon' },
  { key: 'hasTerrace', label: 'Terrasse' },
  { key: 'hasParking', label: 'Parking' },
  { key: 'hasGarage', label: 'Garage' },
  { key: 'hasGarden', label: 'Jardin' },
  { key: 'isFurnished', label: 'Meublé' },
];

function propertyToFormValues(property: Property, amenityIds: string[]): PropertyInput {
  return {
    title: property.title,
    description: property.description,
    slug: property.slug,
    propertyType: property.property_type,
    city: property.city,
    latitude: property.latitude ?? undefined,
    longitude: property.longitude ?? undefined,
    monthlyPrice: property.monthly_price,
    serviceCharges: property.service_charges,
    depositAmount: property.deposit_amount,
    viewingFee: property.viewing_fee,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    rooms: property.rooms ?? undefined,
    contractType: property.contract_type,
    interiorType: property.interior_type,
    maintenanceCondition: property.maintenance_condition,
    hasElevator: property.has_elevator,
    hasBalcony: property.has_balcony,
    hasTerrace: property.has_terrace,
    hasParking: property.has_parking,
    hasGarage: property.has_garage,
    hasGarden: property.has_garden,
    isFurnished: property.is_furnished,
    availableFrom: property.available_from ?? '',
    minimumStayMonths: property.minimum_stay_months ?? 12,
    status: property.status,
    isPublished: property.is_published,
    isFeatured: property.is_featured,
    amenityIds,
  };
}

export function PropertyForm({
  mode,
  propertyId,
  property,
  currentAmenityIds,
  amenities,
}: {
  mode: 'create' | 'edit';
  propertyId?: string;
  property?: Property;
  currentAmenityIds?: string[];
  amenities: Amenity[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [slugTouched, setSlugTouched] = React.useState(mode === 'edit');
  const [slugStatus, setSlugStatus] = React.useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const slugCheckId = React.useRef(0);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<PropertyInput>({
    resolver: zodResolver(propertySchema),
    defaultValues:
      mode === 'edit' && property
        ? propertyToFormValues(property, currentAmenityIds ?? [])
        : {
            title: '',
            description: '',
            slug: '',
            propertyType: 'chalet',
            city: '',
            monthlyPrice: 0,
            serviceCharges: 0,
            depositAmount: 0,
            viewingFee: 0,
            bedrooms: 1,
            bathrooms: 1,
            contractType: 'Location saisonnière à la semaine',
            interiorType: 'Meublé',
            maintenanceCondition: 'Bien',
            hasElevator: false,
            hasBalcony: false,
            hasTerrace: false,
            hasParking: false,
            hasGarage: false,
            hasGarden: false,
            isFurnished: true,
            minimumStayMonths: 1,
            status: 'draft',
            isPublished: false,
            isFeatured: false,
            amenityIds: [],
          },
  });

  const title = watch('title');
  const slug = watch('slug');
  const debouncedSlug = useDebouncedValue(slug, 250);

  React.useEffect(() => {
    if (!slugTouched && title) {
      setValue('slug', slugify(title));
    }
  }, [title, slugTouched, setValue]);

  React.useEffect(() => {
    // Annule immédiatement une vérification devenue obsolète pendant que
    // l'utilisateur continue à modifier le titre ou le slug.
    slugCheckId.current += 1;
    setSlugStatus('idle');
    clearErrors('slug');
  }, [slug, clearErrors]);

  React.useEffect(() => {
    const isValidSlug = debouncedSlug.length >= 5 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(debouncedSlug);
    if (!isValidSlug) {
      setSlugStatus('idle');
      return;
    }

    const checkId = ++slugCheckId.current;
    setSlugStatus('checking');

    void checkPropertySlugAvailability(debouncedSlug, propertyId).then((result) => {
      if (checkId !== slugCheckId.current) return;

      if (!result.available && !result.error) {
        setSlugStatus('taken');
        setError('slug', { type: 'duplicate', message: 'Cet appartement existe déjà (ce slug est déjà utilisé).' });
        return;
      }

      setSlugStatus(result.available ? 'available' : 'idle');
      if (result.available) clearErrors('slug');
    });
  }, [debouncedSlug, propertyId, setError, clearErrors]);

  function onSubmit(data: PropertyInput) {
    startTransition(async () => {
      const result =
        mode === 'create' ? await createProperty(data) : await updateProperty(propertyId!, data);

      if (result.success) {
        toast.success(result.message);
        if (mode === 'create' && result.data?.id) {
          router.push(`/admin/appartements/${result.data.id}`);
        } else {
          router.refresh();
        }
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* INFORMATIONS GÉNÉRALES */}
      <FormSection title="Informations générales">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="title">Titre</Label>
            <Input id="title" placeholder="Ex : Chalet familial avec sauna à La Clusaz" {...register('title')} />
            <FieldError message={errors.title?.message} />
            {slugStatus === 'taken' && (
              <div
                role="alert"
                aria-live="assertive"
                className="mt-2 flex items-center gap-2 rounded-lg border border-brick-500/30 bg-brick-500/10 px-3 py-2 text-sm font-semibold text-brick-500"
              >
                <CircleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
                Cet appartement existe déjà.
              </div>
            )}
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="description">Présentation complète</Label>
            <Textarea
              id="description"
              rows={10}
              placeholder={'Indiquez la capacité maximale, les couchages, les salles de bain, les équipements, les distances, les tarifs saisonniers et les services inclus.'}
              {...register('description')}
            />
            <p className="mt-1.5 text-xs text-ink-400">
              Structure conseillée : présentation, capacité et couchages, équipements, emplacement, puis tarifs par saison. Entourez un passage de **deux astérisques** pour l’afficher en gras.
            </p>
            <FieldError message={errors.description?.message} />
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="slug">Slug (URL)</Label>
              <button
                type="button"
                onClick={() => {
                  setValue('slug', slugify(title || ''));
                  setSlugTouched(false);
                }}
                className="mb-1.5 flex items-center gap-1 text-xs font-medium text-canal-600 hover:underline"
              >
                <Wand2 className="h-3 w-3" />
                Générer depuis le titre
              </button>
            </div>
            <Input
              id="slug"
              error={errors.slug?.message}
              aria-invalid={Boolean(errors.slug)}
              {...register('slug', { onChange: () => setSlugTouched(true) })}
            />
            {slugStatus === 'checking' && (
              <p className="mt-1.5 text-xs text-ink-400">Vérification de l’existence de l’appartement…</p>
            )}
            {slugStatus !== 'taken' && (
              <FieldError message={errors.slug?.message} />
            )}
          </div>
          <div>
            <Label htmlFor="propertyType">Catégorie</Label>
            <Select id="propertyType" {...register('propertyType')}>
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Statut</Label>
            <Select id="status" {...register('status')}>
              <option value="draft">Brouillon</option>
              <option value="available">Disponible</option>
              <option value="reserved">Réservé</option>
              <option value="rented">Loué</option>
              <option value="unavailable">Indisponible</option>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-700">
            <Checkbox {...register('isPublished')} />
            Publié (visible sur le site public)
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-700">
            <Checkbox {...register('isFeatured')} />
            Mettre en avant sur la page d’accueil
          </label>
        </div>
      </FormSection>

      {/* LOCALISATION */}
      <FormSection title="Localisation">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="city">Ville</Label>
            <Input id="city" placeholder="Ex : Chamonix-Mont-Blanc" {...register('city')} />
            <FieldError message={errors.city?.message} />
          </div>
        </div>
      </FormSection>

      {/* TARIFS */}
      <FormSection title="Tarifs de location">
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-canal-100 bg-canal-50/60 p-3.5">
            <Label htmlFor="monthlyPrice" className="min-h-5">Hors saison</Label>
            <Input id="monthlyPrice" type="number" inputMode="decimal" min="0" step="1" {...register('monthlyPrice')} />
            <p className="mt-1.5 text-xs text-ink-400">€ par semaine</p>
            <FieldError message={errors.monthlyPrice?.message} />
          </div>
          <div className="rounded-xl border border-canal-100 bg-canal-50/60 p-3.5">
            <Label htmlFor="depositAmount" className="min-h-5">Noël – Nouvel An</Label>
            <Input id="depositAmount" type="number" inputMode="decimal" min="0" step="1" {...register('depositAmount')} />
            <p className="mt-1.5 text-xs text-ink-400">€ par semaine</p>
          </div>
          <div className="rounded-xl border border-canal-100 bg-canal-50/60 p-3.5">
            <Label htmlFor="viewingFee" className="min-h-5">Janvier – Mars</Label>
            <Input id="viewingFee" type="number" inputMode="decimal" min="0" step="1" {...register('viewingFee')} />
            <p className="mt-1.5 text-xs text-ink-400">€ par semaine</p>
          </div>
          <div className="rounded-xl border border-canal-100 bg-canal-50/60 p-3.5">
            <Label htmlFor="serviceCharges" className="min-h-5">Forfait ménage</Label>
            <Input id="serviceCharges" type="number" inputMode="decimal" min="0" step="1" {...register('serviceCharges')} />
            <p className="mt-1.5 text-xs text-ink-400">€ par séjour</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-ink-400">Indiquez les montants à la semaine. Mettez 0 uniquement lorsqu’un tarif n’est pas proposé.</p>
      </FormSection>

      {/* CARACTÉRISTIQUES */}
      <FormSection title="Caractéristiques">
        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-4">
          <div>
            <Label htmlFor="bedrooms">Chambres</Label>
            <Input id="bedrooms" type="number" {...register('bedrooms')} />
          </div>
          <div>
            <Label htmlFor="bathrooms">Salles de bain</Label>
            <Input id="bathrooms" type="number" {...register('bathrooms')} />
          </div>
          <div>
            <Label htmlFor="rooms">Pièces / espaces</Label>
            <Input id="rooms" type="number" {...register('rooms')} />
          </div>
          <div>
            <Label htmlFor="availableFrom">Disponible à partir du</Label>
            <Input id="availableFrom" type="date" {...register('availableFrom')} />
          </div>
          <div>
            <Label htmlFor="minimumStayMonths">Séjour minimum (semaines)</Label>
            <Input id="minimumStayMonths" type="number" {...register('minimumStayMonths')} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:grid-cols-3">
          {BOOLEAN_FIELDS.map((field) => (
            <label key={field.key} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-700">
              <Checkbox {...register(field.key as any)} />
              {field.label}
            </label>
          ))}
        </div>
      </FormSection>

      <FormSection title="Séjour et état du bien">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="contractType">Type de contrat</Label>
            <Select id="contractType" {...register('contractType')}>
              <option value="Location saisonnière à la semaine">Location à la semaine</option>
              <option value="Location saisonnière au week-end">Location au week-end</option>
              <option value="Location temporaire">Location temporaire</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="interiorType">Intérieur</Label>
            <Select id="interiorType" {...register('interiorType')}>
              <option value="Non meublé">Non meublé</option>
              <option value="Semi-meublé">Semi-meublé</option>
              <option value="Meublé">Meublé</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="maintenanceCondition">État d’entretien</Label>
            <Select id="maintenanceCondition" {...register('maintenanceCondition')}>
              <option value="Excellent">Excellent</option>
              <option value="Bien">Bien</option>
              <option value="À rafraîchir">À rafraîchir</option>
              <option value="À rénover">À rénover</option>
            </Select>
          </div>
        </div>
      </FormSection>

      {/* ÉQUIPEMENTS */}
      <FormSection title="Équipements">
        <Controller
          control={control}
          name="amenityIds"
          render={({ field }) => (
            <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:grid-cols-3">
              {amenities.map((amenity) => {
                const checked = field.value?.includes(amenity.id);
                return (
                  <label key={amenity.id} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-700">
                    <Checkbox
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) field.onChange([...(field.value ?? []), amenity.id]);
                        else field.onChange((field.value ?? []).filter((id) => id !== amenity.id));
                      }}
                    />
                    {amenity.label_fr}
                  </label>
                );
              })}
            </div>
          )}
        />
      </FormSection>

      <div className="sticky bottom-2 z-20 flex justify-end rounded-2xl bg-sand-100/90 p-2 backdrop-blur sm:bottom-4 sm:bg-transparent sm:p-0">
        <Button
          type="submit"
          size="lg"
          isLoading={isPending}
          disabled={isPending || slugStatus === 'checking' || slugStatus === 'taken'}
          className="w-full shadow-lifted sm:w-auto"
        >
          <Save className="h-4.5 w-4.5" />
          {mode === 'create' ? 'Créer le bien' : 'Enregistrer les modifications'}
        </Button>
      </div>
    </form>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-4 sm:p-6">
      <h2 className="mb-4 font-bold text-ink-900">{title}</h2>
      {children}
    </div>
  );
}
