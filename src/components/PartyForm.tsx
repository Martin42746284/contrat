import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CINUpload from '@/components/CINUpload';
import { PartyInfo, DistributorInfo, CINPhotos } from '@/types/contract';

interface PartyFormProps {
  type: 'fournisseuse' | 'distributrice';
  data: PartyInfo | DistributorInfo;
  onChange: (data: Partial<PartyInfo> | Partial<DistributorInfo>) => void;
  onVerifyCIN: (side: 'recto' | 'verso', imageBase64: string) => void;
  readOnly?: boolean;
}

const PartyForm: React.FC<PartyFormProps> = ({ type, data, onChange, onVerifyCIN, readOnly }) => {
  const isFournisseuse = type === 'fournisseuse';
  const title = isFournisseuse ? 'Informations de la Fournisseuse (Couturière)' : 'Informations de la Distributrice (Vendeuse en ligne)';
  const icon = isFournisseuse ? '✂️' : '🛒';

  // État local pour les champs du formulaire
  const [formData, setFormData] = useState({
    nomComplet: data.nomComplet,
    cin: data.cin,
    adresse: data.adresse,
    telephone: data.telephone,
    nomPage: (data as DistributorInfo).nomPage || '',
  });

  // Synchroniser avec les données du parent quand elles changent
  useEffect(() => {
    setFormData({
      nomComplet: data.nomComplet,
      cin: data.cin,
      adresse: data.adresse,
      telephone: data.telephone,
      nomPage: (data as DistributorInfo).nomPage || '',
    });
  }, [data]);

  // Fonction pour sauvegarder au blur (sortie du champ)
  const handleFieldBlur = (fieldName: keyof typeof formData, value: string) => {
    onChange({ [fieldName]: value });
  };

  // Fonction pour gérer le changement du CIN avec limite de 14 chiffres
  const handleCINChange = (value: string) => {
    // Garder seulement les chiffres
    const digitsOnly = value.replace(/\D/g, '');
    // Limiter à 12 chiffres
    const limited = digitsOnly.slice(0, 12);
    setFormData(prev => ({ ...prev, cin: limited }));
  };

  // Fonction pour gérer le changement du téléphone avec limite de 10 chiffres
  const handlePhoneChange = (value: string) => {
    // Garder seulement les chiffres
    const digitsOnly = value.replace(/\D/g, '');
    // Limiter à 10 chiffres
    const limited = digitsOnly.slice(0, 10);
    setFormData(prev => ({ ...prev, telephone: limited }));
  };

  const updateCIN = (partial: Partial<CINPhotos>) => {
    onChange({ cinPhotos: { ...data.cinPhotos, ...partial } });
  };

  return (
    <div className={`rounded-xl border p-6 space-y-4 animate-fade-in ${readOnly ? 'bg-muted/50 border-border' : 'bg-card border-accent/30 shadow-contract'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
        {readOnly && <span className="ml-auto text-xs font-medium bg-muted px-2 py-1 rounded text-muted-foreground">Lecture seule</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Nom complet *</Label>
          <Input
            value={formData.nomComplet}
            onChange={e => setFormData(prev => ({ ...prev, nomComplet: e.target.value }))}
            onBlur={() => handleFieldBlur('nomComplet', formData.nomComplet)}
            disabled={readOnly}
            placeholder="Nom et prénom"
          />
        </div>
        <div className="space-y-1.5">
          <Label>CIN *</Label>
          <Input
            value={formData.cin}
            onChange={e => handleCINChange(e.target.value)}
            onBlur={() => handleFieldBlur('cin', formData.cin)}
            disabled={readOnly}
            placeholder="Numéro CIN"
            maxLength={14}
          />
          {formData.cin && <p className="text-xs text-muted-foreground">{formData.cin.length}/14 chiffres</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Adresse</Label>
          <Input
            value={formData.adresse}
            onChange={e => setFormData(prev => ({ ...prev, adresse: e.target.value }))}
            onBlur={() => handleFieldBlur('adresse', formData.adresse)}
            disabled={readOnly}
            placeholder="Adresse complète"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Téléphone</Label>
          <Input
            type="tel"
            value={formData.telephone}
            onChange={e => handlePhoneChange(e.target.value)}
            onBlur={() => handleFieldBlur('telephone', formData.telephone)}
            disabled={readOnly}
            placeholder="034 XX XXX XX"
            maxLength={10}
          />
          {formData.telephone && <p className="text-xs text-muted-foreground">{formData.telephone.length}/10 chiffres</p>}
        </div>
        {!isFournisseuse && (
          <div className="space-y-1.5 md:col-span-2">
            <Label>Nom de la page Facebook / Boutique</Label>
            <Input
              value={formData.nomPage}
              onChange={e => setFormData(prev => ({ ...prev, nomPage: e.target.value }))}
              onBlur={() => handleFieldBlur('nomPage', formData.nomPage)}
              disabled={readOnly}
              placeholder="Nom de la boutique en ligne"
            />
          </div>
        )}
      </div>

      {/* CIN Photos */}
      <div className="border-t border-border pt-4 mt-4">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          🪪 Photos de la Carte d'Identité Nationale (CIN) *
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CINUpload
            label="CIN — Recto"
            photo={data.cinPhotos.recto}
            status={data.cinPhotos.rectoStatus}
            error={data.cinPhotos.rectoError}
            onPhotoChange={photo => updateCIN({ recto: photo, rectoStatus: photo ? data.cinPhotos.rectoStatus : 'idle', rectoError: photo ? data.cinPhotos.rectoError : null })}
            onVerify={img => onVerifyCIN('recto', img)}
            disabled={readOnly}
          />
          <CINUpload
            label="CIN — Verso"
            photo={data.cinPhotos.verso}
            status={data.cinPhotos.versoStatus}
            error={data.cinPhotos.versoError}
            onPhotoChange={photo => updateCIN({ verso: photo, versoStatus: photo ? data.cinPhotos.versoStatus : 'idle', versoError: photo ? data.cinPhotos.versoError : null })}
            onVerify={img => onVerifyCIN('verso', img)}
            disabled={readOnly}
          />
        </div>
      </div>
    </div>
  );
};

export default PartyForm;
