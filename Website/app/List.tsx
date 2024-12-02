import Section from "./Section"
import SectionRow from "./SectionRow"
function List() {
    return <>
<Section name="Account">
<SectionRow displayName="By" schemaName="Address1_City" type="StringType" description={""} />
<SectionRow displayName="Adresse" schemaName="Address1_Line1" type="StringType" description={""} />
<SectionRow displayName="Stednavn" schemaName="Address1_Line2" type="StringType" description={"Type the second line of the primary address."} />
<SectionRow displayName="Postnr." schemaName="Address1_PostalCode" type="StringType" description={"Type the ZIP Code or postal code for the primary address."} />
<SectionRow displayName="Oprettet" schemaName="CreatedOn" type="DateTimeType" description={""} />
<SectionRow displayName="Masseudsendelse af mails" schemaName="DoNotBulkEMail" type="BooleanType" description={"Masseudsendelse af mails"} />
<SectionRow displayName="Do not allow Bulk Mails" schemaName="DoNotBulkPostalMail" type="BooleanType" description={"Select whether the account allows bulk postal mail sent through marketing campaigns or quick campaigns. If Do Not Allow is selected, the account can be added to marketing lists, but will be excluded from the postal mail."} />
<SectionRow displayName="Mail" schemaName="DoNotEMail" type="BooleanType" description={""} />
<SectionRow displayName="Opkald" schemaName="DoNotPhone" type="BooleanType" description={""} />
<SectionRow displayName="Do not allow Mails" schemaName="DoNotPostalMail" type="BooleanType" description={"Select whether the account allows direct mail. If Do Not Allow is selected, the account will be excluded from letter activities distributed in marketing campaigns."} />
<SectionRow displayName="Mailadresse" schemaName="EMailAddress1" type="StringType" description={""} />
<SectionRow displayName="Follow Email Activity" schemaName="FollowEmail" type="BooleanType" description={"Information about whether to allow following email activity like opens, attachment views and link clicks for emails sent to the account."} />
<SectionRow displayName="Enhedstype" schemaName="msys_AccountType" type="PicklistType" description={""} />
<SectionRow displayName="Enhed Valideret" schemaName="msys_AccountValidated" type="BooleanType" description={""} />
<SectionRow displayName="Kommune" schemaName="msys_Addess1Municipality" type="LookupType" description={""} />
<SectionRow displayName="By" schemaName="msys_Address1City" type="LookupType" description={""} />
<SectionRow displayName="C/O" schemaName="msys_Address1CO" type="StringType" description={""} />
<SectionRow displayName="Etage" schemaName="msys_Address1Floor" type="StringType" description={"Evt. etage betegnelse ellers ”blank”. Etage skal følge syntaksen 'kl', 'st', '01', '02', '03', ….'99'."} />
<SectionRow displayName="Husbogstav" schemaName="msys_Address1HouseLetter" type="StringType" description={"Modtagerens eventuelle husbogstav. Ellers ”blank”."} />
<SectionRow displayName="Husnummer" schemaName="msys_Address1HouseNumber" type="StringType" description={""} />
<SectionRow displayName="Placering" schemaName="msys_Address1LocationOnFloor" type="StringType" description={"Evt. placering på etage ellers ”blank”. Placering skal følge syntaksen 'tv ', 'th ', 'mf '. Hvis der er mere end fire afleveringssteder på samme etage, navngives placeringen fra venstre mod højre med angivelse af '0001', '0002', '0003', … '9999'. Eller ’A01’, ’A02’, … etc."} />
<SectionRow displayName="Manuel Adresseindtastning" schemaName="msys_Address1ManualAddress" type="BooleanType" description={""} />
<SectionRow displayName="Postnummer" schemaName="msys_Address1Postalcode" type="LookupType" description={""} />
<SectionRow displayName="Region" schemaName="msys_Address1Region" type="LookupType" description={""} />
<SectionRow displayName="Gadenavn" schemaName="msys_Address1StreetName" type="StringType" description={"Navn på gade eller vej."} />
<SectionRow displayName="Land" schemaName="msys_Adresse1Country" type="LookupType" description={""} />
<SectionRow displayName="Rykkersag" schemaName="msys_ArrearsCase" type="LookupType" description={""} />
<SectionRow displayName="Selskabsform" schemaName="msys_CompanyForm" type="PicklistType" description={""} />
<SectionRow displayName="CVR-nr." schemaName="msys_CvrNum" type="StringType" description={""} />
<SectionRow displayName="CVR Status" schemaName="msys_CvrValidationStatus" type="PicklistType" description={""} />
<SectionRow displayName="Debitor" schemaName="msys_Debtor" type="BooleanType" description={""} />
<SectionRow displayName="ZZ_EAN-nr." schemaName="msys_EanNum" type="StringType" description={""} />
<SectionRow displayName="Enhedsnummer" schemaName="msys_Enhedsnummer" type="StringType" description={""} />
<SectionRow displayName="Firmakode" schemaName="msys_ERPCompanyCode" type="StringType" description={""} />
<SectionRow displayName="Omkostningssted" schemaName="msys_ERPCostLocation" type="StringType" description={""} />
<SectionRow displayName="Finanstype" schemaName="msys_ERPType" type="StringType" description={""} />
<SectionRow displayName="Afmeldingskvittering" schemaName="msys_EventCancellationReceipt" type="StringType" description={""} />
<SectionRow displayName="Invitation " schemaName="msys_EventInvite" type="StringType" description={"Kun relevant hvis der udsendes invitationer til dette arrangement. Overstyrer foreningens standardskabelon til dette, kan overstyres på den enkelte invitation."} />
<SectionRow displayName="Tilmeldingskvittering (tilmeldt)" schemaName="msys_EventSignupReceipt" type="StringType" description={""} />
<SectionRow displayName="Tilmeldingskvittering (venteliste)" schemaName="msys_EventSignupWaitlist" type="StringType" description={"Sendes til deltagere, der får en plads på venteliste. "} />
<SectionRow displayName="Ventelistetilbud" schemaName="msys_EventWaitingListOffer" type="StringType" description={""} />
<SectionRow displayName="Oprykning fra venteliste" schemaName="msys_EventWaitingListPromotion" type="StringType" description={""} />
<SectionRow displayName="Skjul på selvbetjening  " schemaName="msys_HideOnSelfservice" type="BooleanType" description={""} />
<SectionRow displayName="Blokeret for opkrævning" schemaName="msys_InvoicingBlocked" type="BooleanType" description={""} />
<SectionRow displayName="Sidst opdateret fra CVR" schemaName="msys_LastModifiedFromCVR" type="DateTimeType" description={""} />
<SectionRow displayName="M4Id" schemaName="msys_M4Id" type="IntegerType" description={"The primary key of the Enhed in M4"} />
<SectionRow displayName="Godkend enhed uden CVR-nr." schemaName="msys_NoCvrNum" type="BooleanType" description={""} />
<SectionRow displayName="Ejerkonstruktion" schemaName="msys_OwnershipStructure" type="PicklistType" description={""} />
<SectionRow displayName="Uddannelsessted" schemaName="msys_PlaceOfEducation" type="BooleanType" description={""} />
<SectionRow displayName="P-nr." schemaName="msys_PNum" type="StringType" description={""} />
<SectionRow displayName="Praksisstart" schemaName="msys_PracticeStart" type="DateTimeType" description={""} />
<SectionRow displayName="Primær Betalingsaftale" schemaName="msys_PrimaryPaymentAgreement" type="LookupType" description={""} />
<SectionRow displayName="FS Standardrolle" schemaName="msys_ProSocietyDefaultRole" type="LookupType" description={""} />
<SectionRow displayName="Offentligt Tilgængeligt" schemaName="msys_PublicAvailable" type="BooleanType" description={"Kun relevant for Faglige Selskaber. Angiver om det Faglige Selskab er \"offentligt tilgængeligt\" og derfor kan fremsøges på selvbetjeningen."} />
<SectionRow displayName="Hent informationer fra CVR" schemaName="msys_RerunUpdateCVR" type="BooleanType" description={""} />
<SectionRow displayName="UVM-nr." schemaName="msys_UvmNum" type="StringType" description={""} />
<SectionRow displayName="Valideret CVR" schemaName="msys_ValidCVR" type="BooleanType" description={""} />
<SectionRow displayName="Arbejdspladstype" schemaName="msys_WorkplaceType" type="LookupType" description={""} />
<SectionRow displayName="Navn" schemaName="Name" type="StringType" description={"Type the company or business name."} />
<SectionRow displayName="Record Created On" schemaName="OverriddenCreatedOn" type="DateTimeType" description={"Date and time that the record was migrated."} />
<SectionRow displayName="Overordnet enhed" schemaName="ParentAccountId" type="LookupType" description={"Choose the parent account associated with this account to show parent and child businesses in reporting and analytics."} />
<SectionRow displayName="Kontaktmetode" schemaName="PreferredContactMethodCode" type="PicklistType" description={""} />
<SectionRow displayName="Primary Contact" schemaName="PrimaryContactId" type="LookupType" description={"Choose the primary contact for the account to provide quick access to contact details."} />
<SectionRow displayName="Status" schemaName="StateCode" type="StateType" description={"Shows whether the account is active or inactive. Inactive accounts are read-only and can't be edited unless they are reactivated."} />
<SectionRow displayName="Telefonnummer" schemaName="Telephone1" type="StringType" description={""} />
</Section>
<Section name="Appointment">
<SectionRow displayName="Møde" schemaName="ActivityId" type="UniqueidentifierType" description={"Unique identifier of the appointment."} />
<SectionRow displayName="Created On" schemaName="CreatedOn" type="DateTimeType" description={"Shows the date and time when the record was created. The date and time are displayed in the time zone selected in Microsoft Dynamics 365 options."} />
<SectionRow displayName="Location" schemaName="Location" type="StringType" description={"Type the location where the appointment will take place, such as a conference room or customer office."} />
<SectionRow displayName="Aktivitetskategori" schemaName="msys_ActivityCategory" type="LookupType" description={""} />
<SectionRow displayName="Medlem ved oprettelse" schemaName="msys_MemberOnCreate" type="BooleanType" description={""} />
<SectionRow displayName="Mødedeltager" schemaName="requiredattendees" type="PartyListType" description={"Liste over nødvendige deltagere i denne aktivitet."} />
<SectionRow displayName="Subject" schemaName="Subject" type="StringType" description={"Type a short description about the objective or primary topic of the appointment."} />
</Section>
<Section name="BusinessUnit">
<SectionRow displayName="Er forening" schemaName="msys_IsAssociation" type="BooleanType" description={"Definerer om denne forretningsenhed er en forening (man kan være medlem af) eller ej."} />
</Section>
<Section name="Contact">
<SectionRow displayName="Account" schemaName="AccountId" type="LookupType" description={"Unique identifier of the account with which the contact is associated."} />
<SectionRow displayName="Hjemmeadresse: By" schemaName="Address1_City" type="StringType" description={""} />
<SectionRow displayName="Hjemmeadresse: Adresse" schemaName="Address1_Line1" type="StringType" description={"Angiv den første linje i den primære adresse."} />
<SectionRow displayName="Hjemmeadresse: Stednavn" schemaName="Address1_Line2" type="StringType" description={"Angiv den anden linje i den primære adresse."} />
<SectionRow displayName="Hjemmeadresse: Postnummer" schemaName="Address1_PostalCode" type="StringType" description={"Type the ZIP Code or postal code for the primary address."} />
<SectionRow displayName="Leveringsadresse: By" schemaName="Address2_City" type="StringType" description={"Type the city for the secondary address."} />
<SectionRow displayName="Leveringsadresse: Adresse" schemaName="Address2_Line1" type="StringType" description={""} />
<SectionRow displayName="Leveringsadresse: Stednavn" schemaName="Address2_Line2" type="StringType" description={""} />
<SectionRow displayName="Leveringsadresse: Postnummer" schemaName="Address2_PostalCode" type="StringType" description={"Type the ZIP Code or postal code for the secondary address."} />
<SectionRow displayName="Faktureringsadresse: By" schemaName="Address3_City" type="StringType" description={"Type the city for the 3rd address."} />
<SectionRow displayName="Faktureringsadresse: Adresse" schemaName="Address3_Line1" type="StringType" description={"the first line of the 3rd address."} />
<SectionRow displayName="Faktureringsadresse: Stednavn" schemaName="Address3_Line2" type="StringType" description={""} />
<SectionRow displayName="Faktureringsadresse: Postnummer" schemaName="Address3_PostalCode" type="StringType" description={""} />
<SectionRow displayName="Fødselsdato" schemaName="BirthDate" type="DateTimeType" description={""} />
<SectionRow displayName="Masseudsendelse af mails " schemaName="DoNotBulkEMail" type="BooleanType" description={"Viser om personen accepterer masseudsendlese af emails sendt gennem markedsføringskampagner. Hvis ikke \"Tillad\" vælges, vil personen blive udelukket mailen."} />
<SectionRow displayName="Mail" schemaName="DoNotEMail" type="BooleanType" description={"Tillad emails"} />
<SectionRow displayName="Opkald" schemaName="DoNotPhone" type="BooleanType" description={"Tillad opkald"} />
<SectionRow displayName="Primær mailadresse" schemaName="EMailAddress1" type="StringType" description={""} />
<SectionRow displayName="Mailadresse for særlig rolle" schemaName="EMailAddress2" type="StringType" description={"E-mailadresse for særlig rolle. "} />
<SectionRow displayName="Arbejdsmailadresse" schemaName="EMailAddress3" type="StringType" description={"Arbejdsmailadresse."} />
<SectionRow displayName="Entity Image" schemaName="EntityImage" type="ImageType" description={"Shows the default image for the record."} />
<SectionRow displayName="Fornavn" schemaName="FirstName" type="StringType" description={""} />
<SectionRow displayName="Navn" schemaName="FullName" type="StringType" description={"Kombination af personens fornavn og efternavn. "} />
<SectionRow displayName="Køn" schemaName="GenderCode" type="PicklistType" description={""} />
<SectionRow displayName="Efternavn" schemaName="LastName" type="StringType" description={""} />
<SectionRow displayName="Middle Name" schemaName="MiddleName" type="StringType" description={"Type the contact's middle name or initial to make sure the contact is addressed correctly."} />
<SectionRow displayName="Telefonnummer" schemaName="MobilePhone" type="StringType" description={"Mobiltelefonnummer."} />
<SectionRow displayName="Konto nr." schemaName="msys_AccounNum" type="StringType" description={""} />
<SectionRow displayName="Hjemmeadresse: Kommune" schemaName="msys_Addess1Municipality" type="LookupType" description={""} />
<SectionRow displayName="Leveringsadresse: Kommune" schemaName="msys_Addess2Municipality" type="LookupType" description={""} />
<SectionRow displayName="Faktureringsadresse: Kommune" schemaName="msys_Addess3Municipality" type="LookupType" description={""} />
<SectionRow displayName="Hjemmeadresse: By (Opslag)" schemaName="msys_Address1City" type="LookupType" description={""} />
<SectionRow displayName="Hjemmeadresse: C/O" schemaName="msys_Address1CO" type="StringType" description={""} />
<SectionRow displayName="Hjemmeadresse: Etage" schemaName="msys_Address1Floor" type="StringType" description={"Evt. etage betegnelse ellers ”blank”. Etage skal følge syntaksen 'kl', 'st', '01', '02', '03', ….'99'."} />
<SectionRow displayName="Hjemmeadresse: Husbogstav" schemaName="msys_Address1HouseLetter" type="StringType" description={"Modtagerens eventuelle husbogstav. Ellers ”blank”."} />
<SectionRow displayName="Hjemmeadresse: Husnummer" schemaName="msys_Address1HouseNumber" type="StringType" description={"Modtagerens husnummer."} />
<SectionRow displayName="Hjemmeadresse: Placering" schemaName="msys_Address1LocationOnFloor" type="StringType" description={"Evt. placering på etage ellers ”blank”. Placering skal følge syntaksen 'tv ', 'th ', 'mf '. Hvis der er mere end fire afleveringssteder på samme etage, navngives placeringen fra venstre mod højre med angivelse af '0001', '0002', '0003', … '9999'. Eller ’A01’, ’A02’, … etc."} />
<SectionRow displayName="Hjemmeadresse: Manuel Adresseindtastning" schemaName="msys_Address1ManualAddress" type="BooleanType" description={"Sættes til ”Ja” hvis det skal være muligt at manuelt indtaste adressefelter fremfor at vælge blandt i liste. Bør som udgangspunkt kun udfyldes, hvis der er tale om et udenlandsk postnummer som ikke findes i systemet."} />
<SectionRow displayName="Hjemmeadresse: Postnummer (Opslag)" schemaName="msys_Address1Postalcode" type="LookupType" description={""} />
<SectionRow displayName="Hjemmeadresse: Region" schemaName="msys_Address1Region" type="LookupType" description={""} />
<SectionRow displayName="Hjemmeadresse: Gadenavn" schemaName="msys_Address1StreetName" type="StringType" description={"Navn på gade eller vej."} />
<SectionRow displayName="Leveringsadresse: By (Opslag)" schemaName="msys_Address2City" type="LookupType" description={""} />
<SectionRow displayName="Leveringsadresse: C/O" schemaName="msys_Address2CO" type="StringType" description={""} />
<SectionRow displayName="Leveringsadresse: Etage" schemaName="msys_Address2Floor" type="StringType" description={"Evt. etage betegnelse ellers ”blank”. Etage skal følge syntaksen 'kl', 'st', '01', '02', '03', ….'99'."} />
<SectionRow displayName="Leveringsadresse: Husbogstav" schemaName="msys_Address2HouseLetter" type="StringType" description={"Modtagerens eventuelle husbogstav. Ellers ”blank”."} />
<SectionRow displayName="Leveringsadresse: Husnummer" schemaName="msys_Address2HouseNumber" type="StringType" description={""} />
<SectionRow displayName="Leveringsadresse: Placering" schemaName="msys_Address2LocationOnFloor" type="StringType" description={"Evt. placering på etage ellers ”blank”. Placering skal følge syntaksen 'tv ', 'th ', 'mf '. Hvis der er mere end fire afleveringssteder på samme etage, navngives placeringen fra venstre mod højre med angivelse af '0001', '0002', '0003', … '9999'. Eller ’A01’, ’A02’, … etc."} />
<SectionRow displayName="Leveringsadresse: Manuel Adresseindtastning" schemaName="msys_Address2ManualAddress" type="BooleanType" description={""} />
<SectionRow displayName="Leveringsadresse: Postnummer (Opslag)" schemaName="msys_Address2Postalcode" type="LookupType" description={""} />
<SectionRow displayName="Leveringsadresse: Region" schemaName="msys_Address2Region" type="LookupType" description={""} />
<SectionRow displayName="Leveringsadresse: Gadenavn" schemaName="msys_Address2StreetName" type="StringType" description={"Navn på gade eller vej."} />
<SectionRow displayName="Faktureringsadresse: By (Opslag)" schemaName="msys_Address3City" type="LookupType" description={""} />
<SectionRow displayName="Faktureringsadresse: C/O" schemaName="msys_Address3CO" type="StringType" description={""} />
<SectionRow displayName="Faktureringsadresse: Etage" schemaName="msys_Address3Floor" type="StringType" description={"Evt. etage betegnelse ellers ”blank”. Etage skal følge syntaksen 'kl', 'st', '01', '02', '03', ….'99'."} />
<SectionRow displayName="Faktureringsadresse: Husbogstav" schemaName="msys_Address3HouseLetter" type="StringType" description={"Modtagerens eventuelle husbogstav. Ellers ”blank”."} />
<SectionRow displayName="Faktureringsadresse: Husnummer" schemaName="msys_Address3HouseNumber" type="StringType" description={""} />
<SectionRow displayName="Faktureringsadresse: Placering" schemaName="msys_Address3LocationOnFloor" type="StringType" description={"Evt. placering på etage ellers ”blank”. Placering skal følge syntaksen 'tv ', 'th ', 'mf '. Hvis der er mere end fire afleveringssteder på samme etage, navngives placeringen fra venstre mod højre med angivelse af '0001', '0002', '0003', … '9999'. Eller ’A01’, ’A02’, … etc."} />
<SectionRow displayName="Faktureringsadresse: Manuel Adresseindtastning" schemaName="msys_Address3ManualAddress" type="BooleanType" description={""} />
<SectionRow displayName="Faktureringsadresse: Postnummer (Opslag)" schemaName="msys_Address3Postalcode" type="LookupType" description={""} />
<SectionRow displayName="Faktureringsadresse: Region" schemaName="msys_Address3Region" type="LookupType" description={""} />
<SectionRow displayName="Faktureringsadresse: Gadenavn" schemaName="msys_Address3StreetName" type="StringType" description={"Navn på gade eller vej."} />
<SectionRow displayName="Hjemmeadresse: Land" schemaName="msys_Adresse1Country" type="LookupType" description={""} />
<SectionRow displayName="Leveringsadresse: Land" schemaName="msys_Adresse2Country" type="LookupType" description={""} />
<SectionRow displayName="Faktureringsadresse: Land" schemaName="msys_Adresse3Country" type="LookupType" description={""} />
<SectionRow displayName="Alder" schemaName="msys_Age" type="DecimalType" description={""} />
<SectionRow displayName="Find Kollega" schemaName="msys_AllowFindColleague" type="BooleanType" description={"Tillad Find Kollega"} />
<SectionRow displayName="Rykkersag" schemaName="msys_ArrearsCase" type="LookupType" description={""} />
<SectionRow displayName="CPR nr." schemaName="msys_Cpr" type="StringType" description={""} />
<SectionRow displayName="CVR ej Praksis" schemaName="msys_CvrNonPractice" type="StringType" description={""} />
<SectionRow displayName="Dadlnet-mail" schemaName="msys_Dadlnetmail" type="BooleanType" description={""} />
<SectionRow displayName="Slettedato" schemaName="msys_DeletionDate" type="DateTimeType" description={"Kommende dag for hvornår personen vil blive slettet automatisk af GDRP-slettejobbet. Personen slettes kun, hvis alle krav for sletning er opfyldt, også selvom der allerede er sat en dato. "} />
<SectionRow displayName="Leveres til" schemaName="msys_DeliveryAddressOpt" type="PicklistType" description={"Vælg hvilken adresse f.eks. Ugeskrift for Læger skal leveres til. "} />
<SectionRow displayName="Levering" schemaName="msys_DeliveryOptInOut" type="PicklistType" description={""} />
<SectionRow displayName="Årsag for inaktiv levering" schemaName="msys_DeliveryStopReason" type="PicklistType" description={""} />
<SectionRow displayName="Uddannelsessted" schemaName="msys_EducationPlace" type="LookupType" description={""} />
<SectionRow displayName="Uddannelsesdato" schemaName="msys_EducationStartDate" type="DateTimeType" description={""} />
<SectionRow displayName="E-mailadresse 4" schemaName="msys_EMailAdresse4" type="StringType" description={"Dadlnet-mailadresse. "} />
<SectionRow displayName="FarPayCustomerNumber" schemaName="msys_FarPayCustomerNumber" type="StringType" description={"Kan midlertidigt opbevare et kundenummer til en FarPay betalingsaftale i forbindelse med indmeldelse af et nyt medlem. "} />
<SectionRow displayName="Dimittenddato" schemaName="msys_GraduationDate" type="DateTimeType" description={""} />
<SectionRow displayName="Blokeret for opkrævning" schemaName="msys_InvoicingBlocked" type="BooleanType" description={""} />
<SectionRow displayName="Seneste login på selvbetjeningen" schemaName="msys_lastlogintoselfservice" type="DateTimeType" description={"Seneste tidspunkt for login i selvbetjeningen"} />
<SectionRow displayName="M4Id" schemaName="msys_M4Id" type="IntegerType" description={"The primary key of the person in M4"} />
<SectionRow displayName="Autorisationsdato" schemaName="msys_MedicalLicenseDate" type="DateTimeType" description={""} />
<SectionRow displayName="Slutdato for autorisations-ID" schemaName="msys_MedicalLicenseEndDate" type="DateTimeType" description={"Den dato hvor det i medlemsystemet er blevet registreret at personens autorisations ID ikke længere er gyldigt. Det er ikke nødvendigvis den præcise dato for hvornår autorisationen blev tilbagetrukket."} />
<SectionRow displayName="Autorisations-ID" schemaName="msys_MedicalLicenseId" type="StringType" description={""} />
<SectionRow displayName="Autorisation gyldig" schemaName="msys_MedicalLicenseValid" type="BooleanType" description={"Hvis sat til “Ja” har personen en gyldig autorisation"} />
<SectionRow displayName="Udmeldelsesårsag" schemaName="msys_MembershipCancellationReason" type="LookupType" description={""} />
<SectionRow displayName="Medlemsnummer" schemaName="msys_MembershipId" type="StringType" description={""} />
<SectionRow displayName="MitId Uuid" schemaName="msys_MitIdUuid" type="StringType" description={""} />
<SectionRow displayName="NemKonto" schemaName="msys_NemKonto" type="BooleanType" description={""} />
<SectionRow displayName="Persontype" schemaName="msys_PersonType" type="PicklistType" description={""} />
<SectionRow displayName="Primær betalingsaftale" schemaName="msys_PrimaryPaymentAgreement" type="LookupType" description={""} />
<SectionRow displayName="Primær Forening" schemaName="msys_PrimaryUnion" type="LookupType" description={""} />
<SectionRow displayName="Primær Arbejdsplads" schemaName="msys_PrimaryWorkplace" type="LookupType" description={""} />
<SectionRow displayName="Vis Profilbillede Offentligt" schemaName="msys_ProfileImagePublicAvailable" type="BooleanType" description={"Tillad at vise profilbillede offentligt, f.eks. visning af udvalgsmedlemmer på Læger.dk"} />
<SectionRow displayName="Vis Profil Offentligt" schemaName="msys_ProfilePublicAvailable" type="BooleanType" description={"Tillad at profilen bruges i offentlige sider, f.eks. visning af udvalgsmedlemmer på Læger.dk"} />
<SectionRow displayName="Udmeldelsesårsag" schemaName="msys_ReasonForWithdrawal" type="PicklistType" description={""} />
<SectionRow displayName="Reg. nr." schemaName="msys_RegNum" type="StringType" description={""} />
<SectionRow displayName="Robinsonflag" schemaName="msys_RobinsonRegister" type="BooleanType" description={""} />
<SectionRow displayName="Ukendt adresse" schemaName="msys_UnknownAddress" type="BooleanType" description={""} />
<SectionRow displayName="Hemmeligt tlf. nr. " schemaName="msys_UnknownPhoneNumber" type="BooleanType" description={""} />
<SectionRow displayName="Verification Token" schemaName="msys_VerificationToken" type="StringType" description={""} />
<SectionRow displayName="Udmeldelsesdato" schemaName="msys_WithdrawalDate" type="DateTimeType" description={""} />
<SectionRow displayName="Company Name" schemaName="ParentCustomerId" type="CustomerType" description={"Select the parent account or parent contact for the contact to provide a quick link to additional details, such as financial information, activities, and opportunities."} />
<SectionRow displayName="Kontaktmetode " schemaName="PreferredContactMethodCode" type="PicklistType" description={""} />
<SectionRow displayName="Status" schemaName="StateCode" type="StateType" description={"Shows whether the contact is active or inactive. Inactive contacts are read-only and can't be edited unless they are reactivated."} />
<SectionRow displayName="Business Phone" schemaName="Telephone1" type="StringType" description={"Type the main phone number for this contact."} />
</Section>
<Section name="Email">
<SectionRow displayName="Duration" schemaName="ActualDurationMinutes" type="IntegerType" description={"Type the number of minutes spent creating and sending the email. The duration is used in reporting."} />
<SectionRow displayName="Bcc" schemaName="bcc" type="PartyListType" description={"Enter the recipients that are included on the email distribution, but are not displayed to other recipients."} />
<SectionRow displayName="Category" schemaName="Category" type="StringType" description={"Type a category to identify the email type, such as lead outreach, customer follow-up, or service alert, to tie the email to a business group or function."} />
<SectionRow displayName="Cc" schemaName="cc" type="PartyListType" description={"Enter the recipients that should be copied on the email."} />
<SectionRow displayName="Created By" schemaName="CreatedBy" type="LookupType" description={"Shows who created the record."} />
<SectionRow displayName="Created On" schemaName="CreatedOn" type="DateTimeType" description={"Shows the date and time when the record was created. The date and time are displayed in the time zone selected in Microsoft Dynamics 365 options."} />
<SectionRow displayName="Created By (Delegate)" schemaName="CreatedOnBehalfBy" type="LookupType" description={"Shows who created the record on behalf of another user."} />
<SectionRow displayName="Send Later" schemaName="DelayedEmailSendTime" type="DateTimeType" description={"Enter the expected date and time when email will be sent."} />
<SectionRow displayName="Description" schemaName="Description" type="MemoType" description={"Type the greeting and message text of the email."} />
<SectionRow displayName="From" schemaName="from" type="PartyListType" description={"Enter the sender of the email."} />
<SectionRow displayName="Reminder Set" schemaName="IsEmailReminderSet" type="BooleanType" description={"For internal use only. Shows whether this email Reminder is Set."} />
<SectionRow displayName="Aktivitetskategori" schemaName="msys_ActivityCategory" type="LookupType" description={""} />
<SectionRow displayName="Medlem ved oprettelse" schemaName="msys_MemberOnCreate" type="BooleanType" description={""} />
<SectionRow displayName="Queue" schemaName="msys_Queue" type="LookupType" description={""} />
<SectionRow displayName="Relevant kunde (teknisk felt)" schemaName="msys_RelevantKunde" type="CustomerType" description={""} />
<SectionRow displayName="Til (kø)" schemaName="msys_ToQueue" type="LookupType" description={"Hvis modtageren af emailen er en kø, peger dette felt på køen. Ellers er feltet tomt."} />
<SectionRow displayName="Record Created On" schemaName="OverriddenCreatedOn" type="DateTimeType" description={"Date and time that the record was migrated."} />
<SectionRow displayName="Ejer" schemaName="OwnerId" type="OwnerType" description={"Enter the user or team who is assigned to manage the record. This field is updated every time the record is assigned to a different user."} />
<SectionRow displayName="Owning Business Unit" schemaName="OwningBusinessUnit" type="LookupType" description={"Unique identifier of the business unit that owns the email activity."} />
<SectionRow displayName="Owning Team" schemaName="OwningTeam" type="LookupType" description={"Unique identifier of the team who owns the email activity."} />
<SectionRow displayName="Owning User" schemaName="OwningUser" type="LookupType" description={"Unique identifier of the user who owns the email activity."} />
<SectionRow displayName="Priority" schemaName="PriorityCode" type="PicklistType" description={"Select the priority so that preferred customers or critical issues are handled quickly."} />
<SectionRow displayName="Regarding" schemaName="RegardingObjectId" type="LookupType" description={"Choose the record that the email relates to."} />
<SectionRow displayName="Due Date" schemaName="ScheduledEnd" type="DateTimeType" description={"Enter the expected due date and time for the activity to be completed to provide details about when the email will be sent."} />
<SectionRow displayName="Start Date" schemaName="ScheduledStart" type="DateTimeType" description={"Enter the expected start date and time for the activity to provide details about the tentative time when the email activity must be initiated."} />
<SectionRow displayName="Date Sent" schemaName="SentOn" type="DateTimeType" description={"Shows the date and time that the email was sent."} />
<SectionRow displayName="SLA" schemaName="SLAId" type="LookupType" description={"Choose the service level agreement (SLA) that you want to apply to the email record."} />
<SectionRow displayName="Activity Status" schemaName="StateCode" type="StateType" description={"Shows whether the email is open, completed, or canceled. Completed and canceled email is read-only and can't be edited."} />
<SectionRow displayName="Status Reason" schemaName="StatusCode" type="StatusType" description={"Select the email's status."} />
<SectionRow displayName="Subject" schemaName="Subject" type="StringType" description={"Type a short description about the objective or primary topic of the email."} />
<SectionRow displayName="To" schemaName="to" type="PartyListType" description={"Enter the account, contact, lead, queue, or user recipients for the email."} />
<SectionRow displayName="To Recipients" schemaName="ToRecipients" type="StringType" description={"Shows the email addresses corresponding to the recipients."} />
</Section>
<Section name="Fax">
<SectionRow displayName="Aktivitetskategori" schemaName="msys_ActivityCategory" type="LookupType" description={""} />
<SectionRow displayName="Medlem ved oprettelse" schemaName="msys_MemberOnCreate" type="BooleanType" description={""} />
<SectionRow displayName="Subject" schemaName="Subject" type="StringType" description={"Type a short description about the objective or primary topic of the fax."} />
</Section>
<Section name="Letter">
<SectionRow displayName="Direction" schemaName="DirectionCode" type="BooleanType" description={"Select the direction of the letter as incoming or outbound."} />
<SectionRow displayName="Aktivitetskategori" schemaName="msys_ActivityCategory" type="LookupType" description={""} />
<SectionRow displayName="Medlem ved oprettelse" schemaName="msys_MemberOnCreate" type="BooleanType" description={""} />
<SectionRow displayName="Subject" schemaName="Subject" type="StringType" description={"Type a short description about the objective or primary topic of the letter."} />
</Section>
<Section name="msdyncrm_customerjourney">
<SectionRow displayName="Oprettet af" schemaName="CreatedBy" type="LookupType" description={"Indicates the person who created this."} />
<SectionRow displayName="Oprettelsesdato" schemaName="CreatedOn" type="DateTimeType" description={"Date and time when the record was created"} />
<SectionRow displayName="Created by (delegate)" schemaName="CreatedOnBehalfBy" type="LookupType" description={"Indicates the person who created this for another person."} />
<SectionRow displayName="Modified by" schemaName="ModifiedBy" type="LookupType" description={"Indicates the person who modified this."} />
<SectionRow displayName="Modified on" schemaName="ModifiedOn" type="DateTimeType" description={"Date and time when the record was modified"} />
<SectionRow displayName="Modified by (delegate)" schemaName="ModifiedOnBehalfBy" type="LookupType" description={"Indicates the person who modified this for another person."} />
<SectionRow displayName="Content settings" schemaName="msdyncrm_ContentSettingsId" type="LookupType" description={"Content settings that apply to this customer journey"} />
<SectionRow displayName="Customer journey designer state" schemaName="msdyncrm_CustomerJourneyDesignerState" type="MemoType" description={"The state of customer journey"} />
<SectionRow displayName="Customer journey" schemaName="msdyncrm_customerjourneyId" type="UniqueidentifierType" description={"Unique ID for entity instances"} />
<SectionRow displayName="Customer journey template" schemaName="msdyncrm_CustomerJourneyTemplate" type="LookupType" description={"The template used to create the initial layout of the customer journey"} />
<SectionRow displayName="Time zone" schemaName="msdyncrm_CustomerJourneyTimeZone" type="IntegerType" description={"Effective time zone for this customer journey"} />
<SectionRow displayName="Description" schemaName="msdyncrm_description" type="MemoType" description={"Enter additional information to describe this customer journey"} />
<SectionRow displayName="End date and time" schemaName="msdyncrm_EndDateTime" type="DateTimeType" description={"The end date of customer journey"} />
<SectionRow displayName="Insights" schemaName="msdyncrm_insights_placeholder" type="StringType" description={""} />
<SectionRow displayName="Name" schemaName="msdyncrm_name" type="StringType" description={"The name of the customer journey"} />
<SectionRow displayName="Published by" schemaName="msdyncrm_publishedby" type="LookupType" description={"Indicates the person who published this."} />
<SectionRow displayName="Purpose" schemaName="msdyncrm_purpose" type="StringType" description={""} />
<SectionRow displayName="Start date and time" schemaName="msdyncrm_StartDateTime" type="DateTimeType" description={"The start date of the customer journey"} />
<SectionRow displayName="Type" schemaName="msdyncrm_Type" type="PicklistType" description={""} />
<SectionRow displayName="Error check results" schemaName="msdyncrm_ValidationResults" type="MemoType" description={""} />
<SectionRow displayName="Record created on" schemaName="OverriddenCreatedOn" type="DateTimeType" description={"Date and time that the record was migrated"} />
<SectionRow displayName="Ejer" schemaName="OwnerId" type="OwnerType" description={"Owner ID"} />
<SectionRow displayName="Owning business unit" schemaName="OwningBusinessUnit" type="LookupType" description={"Indicates the business unit that owns this."} />
<SectionRow displayName="Owning team" schemaName="OwningTeam" type="LookupType" description={"Indicates the team that owns this."} />
<SectionRow displayName="Owning user" schemaName="OwningUser" type="LookupType" description={"Indicates the person who owns this."} />
<SectionRow displayName="Status" schemaName="statecode" type="StateType" description={"Status of the customer journey"} />
<SectionRow displayName="Status reason" schemaName="statuscode" type="StatusType" description={"Reason for the status of the customer journey"} />
</Section>
<Section name="msdyncrm_marketingemail">
<SectionRow displayName="Oprettet af" schemaName="CreatedBy" type="LookupType" description={"Indicates the person who created this."} />
<SectionRow displayName="Oprettelsesdato" schemaName="CreatedOn" type="DateTimeType" description={"Date and time when the record was created"} />
<SectionRow displayName="Created by (delegate)" schemaName="CreatedOnBehalfBy" type="LookupType" description={"Indicates the person who created this for another person."} />
<SectionRow displayName="Modified by" schemaName="ModifiedBy" type="LookupType" description={"Indicates the person who modified this."} />
<SectionRow displayName="Modified on" schemaName="ModifiedOn" type="DateTimeType" description={"Date and time when the record was modified"} />
<SectionRow displayName="Modified by (delegate)" schemaName="ModifiedOnBehalfBy" type="LookupType" description={"Indicates the person who modified this for another person."} />
<SectionRow displayName="Company address" schemaName="msdyncrm_contentsettingscompanyaddress" type="StringType" description={""} />
<SectionRow displayName="Description" schemaName="msdyncrm_Description" type="MemoType" description={""} />
<SectionRow displayName="Designer HTML" schemaName="msdyncrm_designerhtml" type="MemoType" description={"Clean email body: HTML with no CSS inlining and no compression"} />
<SectionRow displayName="Email from address" schemaName="msdyncrm_FromEmail" type="StringType" description={""} />
<SectionRow displayName="Email from name" schemaName="msdyncrm_FromName" type="StringType" description={""} />
<SectionRow displayName="Marketing email" schemaName="msdyncrm_marketingemailId" type="UniqueidentifierType" description={"Unique ID for entity instances"} />
<SectionRow displayName="Navn" schemaName="msdyncrm_Name" type="StringType" description={""} />
<SectionRow displayName="Preview HTML" schemaName="msdyncrm_previewhtml" type="MemoType" description={"Email body used only for preview display purposes"} />
<SectionRow displayName="Preview Text" schemaName="msdyncrm_previewtext" type="StringType" description={"The preview (pre-header) text for marketing email"} />
<SectionRow displayName="Reply-to address" schemaName="msdyncrm_ReplyToEmail" type="StringType" description={""} />
<SectionRow displayName="Emne" schemaName="msdyncrm_subject" type="StringType" description={"The subject of the marketing email"} />
<SectionRow displayName="Email template" schemaName="msdyncrm_TemplateId" type="LookupType" description={"Template for the email"} />
<SectionRow displayName="Test Configuration" schemaName="msdyncrm_testconfiguration" type="MemoType" description={""} />
<SectionRow displayName="Plain text" schemaName="msdyncrm_textpart" type="MemoType" description={""} />
<SectionRow displayName="Forening" schemaName="msys_Organizer" type="LookupType" description={""} />
<SectionRow displayName="Ejer" schemaName="OwnerId" type="OwnerType" description={"Den medarbejder der har oprettet mailen. "} />
<SectionRow displayName="Owning business unit" schemaName="OwningBusinessUnit" type="LookupType" description={"Indicates the business unit that owns this."} />
<SectionRow displayName="Owning team" schemaName="OwningTeam" type="LookupType" description={"Indicates the team that owns this."} />
<SectionRow displayName="Owning user" schemaName="OwningUser" type="LookupType" description={"Indicates the team that owns this."} />
<SectionRow displayName="Status" schemaName="statecode" type="StateType" description={"Status of the marketing email"} />
<SectionRow displayName="Mailstatus" schemaName="statuscode" type="StatusType" description={"Marketing email status reason"} />
</Section>
<Section name="msdynmkt_journey">
<SectionRow displayName="Created By" schemaName="CreatedBy" type="LookupType" description={"Unique identifier of the user who created the record."} />
<SectionRow displayName="Created By (Delegate)" schemaName="CreatedOnBehalfBy" type="LookupType" description={"Unique identifier of the delegate user who created the record."} />
<SectionRow displayName="Modified By" schemaName="ModifiedBy" type="LookupType" description={"Unique identifier of the user who modified the record."} />
<SectionRow displayName="Modified By (Delegate)" schemaName="ModifiedOnBehalfBy" type="LookupType" description={"Unique identifier of the delegate user who modified the record."} />
<SectionRow displayName="Owner" schemaName="OwnerId" type="OwnerType" description={"Owner Id"} />
<SectionRow displayName="Business Unit" schemaName="OwningBusinessUnit" type="LookupType" description={"Unique identifier for the business unit that owns the record"} />
<SectionRow displayName="Owning Team" schemaName="OwningTeam" type="LookupType" description={"Unique identifier for the team that owns the record."} />
<SectionRow displayName="Owning User" schemaName="OwningUser" type="LookupType" description={"Unique identifier for the user that owns the record."} />
</Section>
<Section name="PhoneCall">
<SectionRow displayName="Direction" schemaName="DirectionCode" type="BooleanType" description={"Select the direction of the phone call as incoming or outbound."} />
<SectionRow displayName="Call From" schemaName="from" type="PartyListType" description={"Enter the account, contact, lead, or user who made the phone call."} />
<SectionRow displayName="Aktivitetskategori" schemaName="msys_ActivityCategory" type="LookupType" description={""} />
<SectionRow displayName="Relevant kunde (teknisk felt)" schemaName="msys_CustomerTechnicalField" type="CustomerType" description={""} />
<SectionRow displayName="Medlem ved oprettelse" schemaName="msys_MemberOnCreate" type="BooleanType" description={""} />
<SectionRow displayName="Subject" schemaName="Subject" type="StringType" description={"Type a short description about the objective or primary topic of the phone call."} />
<SectionRow displayName="Call To" schemaName="to" type="PartyListType" description={"Enter the account, contact, lead, or user recipients of the phone call."} />
</Section>
<Section name="ProcessSession">
<SectionRow displayName="Regarding" schemaName="RegardingObjectId" type="LookupType" description={"Unique ID of the object associated with the dialog session"} />
</Section>
<Section name="SyncError">
<SectionRow displayName="Record" schemaName="RegardingObjectId" type="LookupType" description={"Choose the record that the sync error relates to."} />
</Section>
<Section name="Template">
<SectionRow displayName="Send kalenderinvitation" schemaName="msys_CalendarInvite" type="BooleanType" description={"Send kalenderinvitation med tilmeldingsbekræftelsen."} />
</Section>
    </>
}

export default List
