﻿using Microsoft.Xrm.Sdk.Metadata;

namespace Generator;

public static class MetadataExtensions
{
    public static IEnumerable<AttributeMetadata> GetRelevantAttributes(this EntityMetadata entity, HashSet<Guid> attributesInSolution, Dictionary<Guid, int> rootComponentBehaviour)
    {
        // If rootcomponentbehaviour is 0 that means all attributes are included in the solution and we cannot find them via solutioncomponents, even if they are there.
        var attributesToFilter =
            rootComponentBehaviour[entity.MetadataId!.Value] == 0
                ? entity.Attributes.ToList()
                : entity.Attributes.Where(a => a.MetadataId != null && attributesInSolution.Contains(a.MetadataId!.Value)).ToList();

        return attributesToFilter;
    }

    internal static string PrettyDescription(this string description) =>
        description
            .Replace("\"", @"”")
            .Replace("\n", " ");

    public static bool StandardFieldHasChanged(this AttributeMetadata attribute)
    {
        if (attribute.IsCustomAttribute) return false;

        var languagecode = attribute.DisplayName.UserLocalizedLabel?.LanguageCode;

        var fields = GetDefaultFields(languagecode);
        return fields.StandardDescriptionHasChanged(attribute.LogicalName, attribute.Description.UserLocalizedLabel?.Label ?? string.Empty)
            || fields.StandardDisplayNameHasChanged(attribute.LogicalName, attribute.DisplayName.UserLocalizedLabel?.Label ?? string.Empty);
    }

    private static bool StandardDisplayNameHasChanged(this IEnumerable<(string LogicalName, string DisplayName, string Description)> fields, string logicalName, string displayName)
    {
        return fields
            .Where(f => f.LogicalName == logicalName)
            .Any(f => displayName.Equals(f.DisplayName, StringComparison.OrdinalIgnoreCase));
    }

    private static bool StandardDescriptionHasChanged(this IEnumerable<(string LogicalName, string DisplayName, string Description)> fields, string logicalName, string description)
    {
        return fields
            .Where(f => f.LogicalName == logicalName)
            .Any(f => description.Equals(f.Description, StringComparison.OrdinalIgnoreCase));
    }

    private static IEnumerable<(string LogicalName, string DisplayName, string Description)> GetDefaultFields(int? languageCode)
    {
        switch (languageCode)
        {
            case 1030:
                return DanishDefaultFields;
            case 1033:
                return EnglishDefaultFields;
            default:
                return EnglishDefaultFields;
        }
    }

    // This list is incomplete as same field may have different names and description.
    private static List<(string LogicalName, string DisplayName, string Description)> EnglishDefaultFields => new()
    {
        ( "activityadditionalparams", "Activity Additional Parameters", "Additional information provided by the external application as JSON. For internal use only." ),
        ( "activityid", "Activity", "Unique identifier of the activity." ),
        ( "activitytypecode", "Activity Type", "Type of activity." ),
        ( "actualdurationminutes", "Actual Duration", "Actual duration of the activity in minutes." ),
        ( "actualend", "Actual End", "Actual end time of the activity." ),
        ( "actualstart", "Actual Start", "Actual start time of the activity." ),
        ( "bcc", "BCC", "Blind Carbon-copy (bcc) recipients of the activity." ),
        ( "cc", "CC", "Carbon-copy (cc) recipients of the activity." ),
        ( "community", "Social Channel", "Shows how contact about the social activity originated, such as from Twitter or Facebook. This field is read-only." ),
        ( "createdby", "Created By", "Unique identifier of the user who created the activity." ),
        ( "createdby", "Created By", "Unique identifier of the user who created the record." ),
        ( "createdon", "Created On", "Date and time when the record was created." ),
        ( "createdon", "Date Created", "Date and time when the activity was created." ),
        ( "createdonbehalfby", "Created By (Delegate)", "Unique identifier of the delegate user who created the activity." ),
        ( "createdonbehalfby", "Created By (Delegate)", "Unique identifier of the delegate user who created the activitypointer." ),
        ( "createdonbehalfby", "Created By (Delegate)", "Unique identifier of the delegate user who created the record." ),
        ( "customers", "Customers", "Customer with which the activity is associated." ),
        ( "description", "Description", "Description of the activity." ),
        ( "deliverylastattemptedon", "Date Delivery Last Attempted", "Date and time when the delivery of the activity was last attempted." ),
        ( "deliveryprioritycode", "Delivery Priority", "Priority of delivery of the activity to the email server." ),
        ( "exchangeitemid", "Exchange Item ID", "The message id of activity which is returned from Exchange Server." ),
        ( "exchangerate", "Exchange Rate", "Exchange rate for the currency associated with the activitypointer with respect to the base currency." ),
        ( "exchangerate", "Exchange Rate", "Exchange rate for the currency associated with the entity with respect to the base currency." ),
        ( "exchangeweblink", "Exchange WebLink", "Shows the web link of Activity of type email." ),
        ( "from", "From", "Person who the activity is from." ),
        ( "importsequencenumber", "Import Sequence Number", "Sequence number of the import that created this record." ),
        ( "instancetypecode", "Recurring Instance Type", "Type of instance of a recurring series." ),
        ( "isbilled", "Is Billed", "Information regarding whether the activity was billed as part of resolving a case." ),
        ( "ismapiprivate", "Is Private", "For internal use only." ),
        ( "isregularactivity", "Is Regular Activity", "Information regarding whether the activity is a regular activity type or event type." ),
        ( "isworkflowcreated", "Is Workflow Created", "Information regarding whether the activity was created from a workflow rule." ),
        ( "lastonholdtime", "Last On Hold Time", "Contains the date and time stamp of the last on hold time." ),
        ( "leftvoicemail", "Left Voice Mail", "Left the voice mail" ),
        ( "modifiedby", "Modified By", "Unique identifier of user who last modified the activity." ),
        ( "modifiedby", "Modified By", "Unique identifier of the user who modified the record." ),
        ( "modifiedon", "Last Updated", "Date and time when activity was last modified." ),
        ( "modifiedon", "Modified On", "Date and time when the record was modified." ),
        ( "modifiedonbehalfby", "Modified By (Delegate)", "Unique identifier of the delegate user who last modified the activitypointer." ),
        ( "modifiedonbehalfby", "Modified By (Delegate)", "Unique identifier of the delegate user who modified the record." ),
        ( "onholdtime", "On Hold Time (Minutes)", "Shows how long, in minutes, that the record was on hold." ),
        ( "optionalattendees", "Optional Attendees", "List of optional attendees for the activity." ),
        ( "organizer", "Organizer", "Person who organized the activity." ),
        ( "overriddencreatedon", "Record Created On", "Date and time that the record was migrated." ),
        ( "ownerid", "Owner", "Owner Id" ),
        ( "ownerid", "Owner", "Unique identifier of the user or team who owns the activity." ),
        ( "owningbusinessunit", "Owning Business Unit", "Unique identifier for the business unit that owns the record" ),
        ( "owningbusinessunit", "Owning Business Unit", "Unique identifier of the business unit that owns the activity." ),
        ( "owningteam", "Owning Team", "Unique identifier for the team that owns the record." ),
        ( "owningteam", "Owning Team", "Unique identifier of the team that owns the activity." ),
        ( "owninguser", "Owning User", "Unique identifier for the user that owns the record." ),
        ( "owninguser", "Owning User", "Unique identifier of the user that owns the activity." ),
        ( "partners", "Outsource Vendors", "Outsource vendor with which activity is associated." ),
        ( "postponeactivityprocessinguntil", "Delay activity processing until", "For internal use only." ),
        ( "prioritycode", "Priority", "Priority of the activity." ),
        ( "processid", "Process", "Unique identifier of the Process." ),
        ( "regardingobjectid", "Regarding", "Unique identifier of the object with which the activity is associated." ),
        ( "requiredattendees", "Required Attendees", "List of required attendees for the activity." ),
        ( "resources", "Resources", "Users or facility/equipment that are required for the activity." ),
        ( "scheduleddurationminutes", "Scheduled Duration", "Scheduled duration of the activity, specified in minutes." ),
        ( "scheduledend", "Due Date", "Scheduled end time of the activity." ),
        ( "scheduledstart", "Start Date", "Scheduled start time of the activity." ),
        ( "sendermailboxid", "Sender's Mailbox", "Unique identifier of the mailbox associated with the sender of the email message." ),
        ( "senton", "Date Sent", "Date and time when the activity was sent." ),
        ( "seriesid", "Series Id", "Uniqueidentifier specifying the id of recurring series of an instance." ),
        ( "serviceid", "Service", "Unique identifier of an associated service." ),
        ( "slaid", "SLA", "Choose the service level agreement (SLA) that you want to apply to the case record." ),
        ( "slainvokedid", "Last SLA applied", "Last SLA that was applied to this case. This field is for internal use only." ),
        ( "sortdate", "Sort Date", "Shows the date and time by which the activities are sorted." ),
        ( "stageid", "(Deprecated) Process Stage", "Unique identifier of the Stage." ),
        ( "statecode", "Activity Status", $"Status of the activity." ),
        ( "subject", "Subject", "Subject associated with the activity." ),
        ( "timezoneruleversionnumber", "Time Zone Rule Version Number", "For internal use only." ),
        ( "to", "To", "Person who is the receiver of the activity." ),
        ( "transactioncurrencyid", "Currency", "Unique identifier of the currency associated with the activitypointer." ),
        ( "transactioncurrencyid", "Currency", "Unique identifier of the currency associated with the entity." ),
        ( "traversedpath", "(Deprecated) Traversed Path", "For internal use only." ),
        ( "utcconversiontimezonecode", "UTC Conversion Time Zone Code", "Time zone code that was in use when the record was created." ),
        ( "versionnumber", "Version Number", "Version number of the activity." ),
        ( "versionnumber", "Version Number", "Version Number" ),
    };

    // This list is incomplete as same field may have different names and description.
    private static List<(string LogicalName, string DisplayName, string Description)> DanishDefaultFields => new()
    {
        ( "activityadditionalparams", "Flere parametre for aktivitet", "Yderligere oplysninger leveret af det eksterne program som JSON. Kun til intern brug." ),
        ( "activityid", "Aktivitet", "Entydigt id for aktiviteten." ),
        ( "activitytypecode", "Aktivitetstype", "Aktivitetstypen." ),
        ( "actualdurationminutes", "Faktisk varighed", "Aktivitetens faktiske varighed i minutter." ),
        ( "actualend", "Faktisk slutning", "Aktivitetens faktiske sluttidspunkt." ),
        ( "actualstart", "Faktisk start", "Aktivitetens faktiske starttidspunkt." ),
        ( "bcc", "Bcc", "Angiv de modtagere, der er inkluderet i maildistributionen, men som ikke vises til andre modtagere." ),
        ( "cc", "Cc", "Angiv de modtagere, der skal have en kopi af mailen." ),
        ( "allparties", "Alle parter i aktiviteter", "Alle aktivitetsparter, der er knyttet til denne aktivitet." ),
        ( "community", "Social kanal", "Viser, hvor kontakt om den sociale aktivitet stammer fra, f.eks. fra Twitter eller Facebook. Dette felt er skrivebeskyttet." ),
        ( "createdby", "Oprettet af", "Entydigt id for den bruger, der oprettede aktiviteten." ),
        ( "createdon", "Dato for oprettelse", "Dato og klokkeslæt for oprettelse af aktiviteten." ),
        ( "createdonbehalfby", "Oprettet af (stedfortræder)", "Entydigt id for den stedfortrædende bruger, der oprettede aktivitetspointeren." ),
        ( "deliverylastattemptedon", "Dato for seneste leveringsforsøg", "Dato og klokkeslæt for det seneste forsøg på levering af aktiviteten." ),
        ( "deliveryprioritycode", "Leveringsprioritet", "Prioritet for levering af aktiviteten til mailserveren." ),
        ( "description", "Beskrivelse", "Beskrivelse af aktiviteten." ),
        ( "descriptionblobid", "Id for beskrivelsesfil", "Fil, der indeholder beskrivelsesindhold." ),
        ( "exchangeitemid", "Id for Exchange-element", "Meddelelses-id'et for aktivitet, der returneres fra Exchange Server." ),
        ( "exchangerate", "Valutakurs", "Valutakurs for den valuta, der er tilknyttet aktivitetspointeren, i forhold til grundvalutaen." ),
        ( "exchangeweblink", "Exchange WebLink", "Viser weblinket for aktivitet af typen mail." ),
        ( "instancetypecode", "Tilbagevendende forekomsttype", "Forekomsttype for en tilbagevendende serie." ),
        ( "isbilled", "Er faktureret", "Angiver, om aktiviteten blev faktureret som en del af løsning af en sag." ),
        ( "ismapiprivate", "Er privat", "Kun til intern brug." ),
        ( "isregularactivity", "Er en almindelig aktivitet", "Oplysninger om, hvorvidt aktiviteten er en almindelig aktivitetstype eller hændelsestype." ),
        ( "isworkflowcreated", "Er der oprettet en arbejdsproces?", "Angiver, om aktiviteten blev oprettet ud fra en arbejdsprocesregel." ),
        ( "lastonholdtime", "Seneste tid for I venteposition", "Indeholder dato- og klokkeslætsstemplet for den seneste tid for I venteposition." ),
        ( "leftvoicemail", "Har lagt talebesked", "Har lagt talebeskeden" ),
        ( "modifiedby", "Ændret af", "Entydigt id for den bruger, der sidst ændrede aktiviteten." ),
        ( "modifiedon", "Sidst opdateret", "Dato og klokkeslæt for den seneste ændring af aktiviteten." ),
        ( "modifiedonbehalfby", "Ændret af (stedfortræder)", "Entydigt id for den stedfortrædende bruger, der senest ændrede aktivitetspointeren." ),
        ( "onholdtime", "Tid for I venteposition (minutter)", "Viser, hvor længe posten var i venteposition i minutter." ),
        ( "ownerid", "Ejer", "Entydigt id for den bruger eller det team, der ejer aktiviteten." ),
        ( "owningbusinessunit", "Ejende afdeling", "Entydigt id for den afdeling, der ejer aktiviteten." ),
        ( "owningteam", "Ejende team", "Entydigt id for det team, der ejer aktiviteten." ),
        ( "owninguser", "Ejende bruger", "Entydigt id for den bruger, der ejer aktiviteten." ),
        ( "postponeactivityprocessinguntil", "Udskyd aktivitetsbehandlingen indtil", "Kun til intern brug." ),
        ( "prioritycode", "Prioritet", "Aktivitetens prioritet." ),
        ( "processid", "Proces", "Entydigt id for processen." ),
        ( "regardingobjectid", "Angående", "Entydigt id for det objekt, som aktiviteten er tilknyttet." ),
        ( "scheduleddurationminutes", "Planlagt varighed", "Planlagt varighed af aktiviteten, angivet i minutter." ),
        ( "scheduledend", "Forfaldsdato", "Aktivitetens planlagte sluttidspunkt." ),
        ( "scheduledstart", "Startdato", "Aktivitetens planlagte starttidspunkt." ),
        ( "sendermailboxid", "Afsenders postkasse", "Entydigt id for den postkasse, der er tilknyttet afsenderen af mailen." ),
        ( "senton", "Sendt", "Dato og klokkeslæt for afsendelse af aktiviteten." ),
        ( "seriesid", "Serie-id", "Entydigt id for en tilbagevendende serie af en forekomst." ),
        ( "slaid", "SLA", "Vælg den serviceaftale (SLA), du vil anvende på sagsposten." ),
        ( "slainvokedid", "Sidst anvendte SLA", "Sidste SLA, der blev anvendt til denne sag. Dette felt er kun beregnet til intern brug." ),
        ( "sortdate", "Sorteringsdato", "Viser den dato og det klokkeslæt, aktiviteterne er sorteret efter." ),
        ( "stageid", "(Udfaset) Navn på procesfase", "Entydigt id for fasen." ),
        ( "statecode", "Aktivitetsstatus", "Status for aktiviteten." ),
        ( "statuscode", "Statusårsag", "Årsag til aktivitetens status." ),
        ( "subject", "Emne", "Det emne, der er tilknyttet aktiviteten." ),
        ( "timezoneruleversionnumber", "Versionsnummeret for tidszonereglen", "Kun til intern brug." ),
        ( "transactioncurrencyid", "Valuta", "Entydigt id for den valuta, der er tilknyttet aktivitetspointeren." ),
        ( "traversedpath", "(Udfaset) Gennemløbet sti", "Kun til intern brug." ),
        ( "utcconversiontimezonecode", "Tidszonekode til UTC-konvertering", "Den tidszonekode, der var i brug ved oprettelse af posten." ),
        ( "versionnumber", "Versionsnummer", "Versionsnummer for aktiviteten." )
    };
}
