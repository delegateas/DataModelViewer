using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Metadata;
using System.Diagnostics;

namespace Generator;

public static class MetadataExtensions
{
    public static IEnumerable<AttributeMetadata> GetRelevantAttributes(
        this EntityMetadata entity,
        Dictionary<Guid, int> entityIdToRootBehavior,
        HashSet<Guid> attributesInSolution,
        string publisherPrefix,
        HashSet<string> entityLogicalNamesInSolution)
    {
        var isRoot = entityIdToRootBehavior[entity.MetadataId!.Value] == 0;
        var attributesToFilter =
            isRoot
                ? entity.Attributes.ToList()
                : entity.Attributes.Where(a => a.MetadataId != null && attributesInSolution.Contains(a.MetadataId!.Value)).ToList();



        return attributesToFilter
            .Where(x => !IsInvalidStandardField(x, entity.DisplayName.UserLocalizedLabel?.Label ?? string.Empty));
    }

    private static bool IsInvalidStandardField(AttributeMetadata attribute, string entityDisplayName)
    {
        var displayName = attribute.DisplayName?.UserLocalizedLabel?.Label;
        var description = attribute.Description?.UserLocalizedLabel?.Label;

        var standardFieldToDefaultName =
            DefaultFields
            .Concat(new[]
            {
                ( "statecode", ("Status", $"Status of the {entityDisplayName}") ),
            })
        .GroupBy(x => x.Item1)
        .ToDictionary(x => x.Key, x => x.ToList());

        if (standardFieldToDefaultName.TryGetValue(attribute.LogicalName, out var defaultFields))
        {
            return defaultFields.Exists(defaultField => 
                displayName == defaultField.Item2.Item1 &&
                 description == defaultField.Item2.Item2);
        }

        if (attribute.LogicalName.EndsWith("_base"))
        {
            return true;
        }

        if (attribute.LogicalName == "statuscode" && 
            description == $"Reason for the status of the {entityDisplayName}" &&
            IsStandardStatusOptions(attribute))
        {
            return true;
        }

        return false;
    }

    private static bool IsStandardStatusOptions(AttributeMetadata attribute)
    {
        if (attribute is StatusAttributeMetadata metadata)
        {
            return metadata.OptionSet.Options.All(x => x.Value == 1 || x.Value == 2);
        }

        return false;
    }

    internal static string PrettyDescription(this string description) =>
        description
            .Replace("\"", @"”")
            .Replace("\n", " ");

    private static List<(string LogicalName, (string DefaultDisplayName, string DefaultDescription) StandardValues)> DefaultFields = new()
        {
            ( "activityadditionalparams", ("Activity Additional Parameters", "Additional information provided by the external application as JSON. For internal use only.") ),
            ( "activityid", ("Activity", "Unique identifier of the activity.") ),
            ( "activitytypecode", ("Activity Type", "Type of activity.") ),
            ( "actualdurationminutes", ("Actual Duration", "Actual duration of the activity in minutes.") ),
            ( "actualend", ("Actual End", "Actual end time of the activity.") ),
            ( "actualstart", ("Actual Start", "Actual start time of the activity.") ),
            ( "bcc", ("BCC", "Blind Carbon-copy (bcc) recipients of the activity.") ),
            ( "cc", ("CC", "Carbon-copy (cc) recipients of the activity.") ),
            ( "community", ("Social Channel", "Shows how contact about the social activity originated, such as from Twitter or Facebook. This field is read-only.") ),
            ( "createdby", ("Created By", "Unique identifier of the user who created the activity.") ),
            ( "createdby", ("Created By", "Unique identifier of the user who created the record.") ),
            ( "createdon", ("Created On", "Date and time when the record was created.") ),
            ( "createdon", ("Date Created", "Date and time when the activity was created.") ),
            ( "createdonbehalfby", ("Created By (Delegate)", "Unique identifier of the delegate user who created the activity.") ),
            ( "createdonbehalfby", ("Created By (Delegate)", "Unique identifier of the delegate user who created the activitypointer.") ),
            ( "createdonbehalfby", ("Created By (Delegate)", "Unique identifier of the delegate user who created the record.") ),
            ( "customers", ("Customers", "Customer with which the activity is associated.") ),
            ( "description", ("Description", "Description of the activity.") ),
            ( "deliverylastattemptedon", ("Date Delivery Last Attempted", "Date and time when the delivery of the activity was last attempted.") ),
            ( "deliveryprioritycode", ("Delivery Priority", "Priority of delivery of the activity to the email server.") ),
            ( "exchangeitemid", ("Exchange Item ID", "The message id of activity which is returned from Exchange Server.") ),
            ( "exchangerate", ("Exchange Rate", "Exchange rate for the currency associated with the activitypointer with respect to the base currency.") ),
            ( "exchangerate", ("Exchange Rate", "Exchange rate for the currency associated with the entity with respect to the base currency.") ),
            ( "exchangeweblink", ("Exchange WebLink", "Shows the web link of Activity of type email.") ),
            ( "from", ("From", "Person who the activity is from.") ),
            ( "importsequencenumber", ("Import Sequence Number", "Sequence number of the import that created this record.") ),
            ( "instancetypecode", ("Recurring Instance Type", "Type of instance of a recurring series.") ),
            ( "isbilled", ("Is Billed", "Information regarding whether the activity was billed as part of resolving a case.") ),
            ( "ismapiprivate", ("Is Private", "For internal use only.") ),
            ( "isregularactivity", ("Is Regular Activity", "Information regarding whether the activity is a regular activity type or event type.") ),
            ( "isworkflowcreated", ("Is Workflow Created", "Information regarding whether the activity was created from a workflow rule.") ),
            ( "lastonholdtime", ("Last On Hold Time", "Contains the date and time stamp of the last on hold time.") ),
            ( "leftvoicemail", ("Left Voice Mail", "Left the voice mail") ),
            ( "modifiedby", ("Modified By", "Unique identifier of user who last modified the activity.") ),
            ( "modifiedby", ("Modified By", "Unique identifier of the user who modified the record.") ),
            ( "modifiedon", ("Last Updated", "Date and time when activity was last modified.") ),
            ( "modifiedon", ("Modified On", "Date and time when the record was modified.") ),
            ( "modifiedonbehalfby", ("Modified By (Delegate)", "Unique identifier of the delegate user who last modified the activitypointer.") ),
            ( "modifiedonbehalfby", ("Modified By (Delegate)", "Unique identifier of the delegate user who modified the record.") ),
            ( "onholdtime", ("On Hold Time (Minutes)", "Shows how long, in minutes, that the record was on hold.") ),
            ( "optionalattendees", ("Optional Attendees", "List of optional attendees for the activity.") ),
            ( "organizer", ("Organizer", "Person who organized the activity.") ),
            ( "overriddencreatedon", ("Record Created On", "Date and time that the record was migrated.") ),
            ( "ownerid", ( "Owner", "Owner Id") ),
            ( "ownerid", ( "Owner", "Unique identifier of the user or team who owns the activity.") ),
            ( "owningbusinessunit", ("Owning Business Unit", "Unique identifier for the business unit that owns the record") ),
            ( "owningbusinessunit", ("Owning Business Unit", "Unique identifier of the business unit that owns the activity.") ),
            ( "owningteam", ("Owning Team", "Unique identifier for the team that owns the record.") ),
            ( "owningteam", ("Owning Team", "Unique identifier of the team that owns the activity.") ),
            ( "owninguser", ("Owning User", "Unique identifier for the user that owns the record.") ),
            ( "owninguser", ("Owning User", "Unique identifier of the user that owns the activity.") ),
            ( "partners", ("Outsource Vendors", "Outsource vendor with which activity is associated.") ),
            ( "postponeactivityprocessinguntil", ("Delay activity processing until", "For internal use only.") ),
            ( "prioritycode", ("Priority", "Priority of the activity.") ),
            ( "processid", ("Process", "Unique identifier of the Process.") ),
            ( "regardingobjectid", ("Regarding", "Unique identifier of the object with which the activity is associated.") ),
            ( "requiredattendees", ("Required Attendees", "List of required attendees for the activity.") ),
            ( "resources", ("Resources", "Users or facility/equipment that are required for the activity.") ),
            ( "scheduleddurationminutes", ("Scheduled Duration", "Scheduled duration of the activity, specified in minutes.") ),
            ( "scheduledend", ("Due Date", "Scheduled end time of the activity.") ),
            ( "scheduledstart", ("Start Date", "Scheduled start time of the activity.") ),
            ( "sendermailboxid", ("Sender's Mailbox", "Unique identifier of the mailbox associated with the sender of the email message.") ),
            ( "senton", ("Date Sent", "Date and time when the activity was sent.") ),
            ( "seriesid", ("Series Id", "Uniqueidentifier specifying the id of recurring series of an instance.") ),
            ( "serviceid", ("Service", "Unique identifier of an associated service.") ),
            ( "slaid", ("SLA", "Choose the service level agreement (SLA) that you want to apply to the case record.") ),
            ( "slainvokedid", ("Last SLA applied", "Last SLA that was applied to this case. This field is for internal use only.") ),
            ( "sortdate", ("Sort Date", "Shows the date and time by which the activities are sorted.") ),
            ( "stageid", ( "(Deprecated) Process Stage", "Unique identifier of the Stage.") ),
            ( "statecode", ("Activity Status", $"Status of the activity.") ),
            ( "subject", ("Subject", "Subject associated with the activity.") ),
            ( "timezoneruleversionnumber", ("Time Zone Rule Version Number", "For internal use only.") ),
            ( "to", ("To", "Person who is the receiver of the activity.") ),
            ( "transactioncurrencyid", ("Currency", "Unique identifier of the currency associated with the activitypointer.") ),
            ( "transactioncurrencyid", ("Currency", "Unique identifier of the currency associated with the entity.") ),
            ( "traversedpath", ("(Deprecated) Traversed Path", "For internal use only.") ),
            ( "utcconversiontimezonecode", ("UTC Conversion Time Zone Code", "Time zone code that was in use when the record was created.") ),
            ( "versionnumber", ("Version Number", "Version number of the activity.") ),
            ( "versionnumber", ("Version Number", "Version Number") ),
        };
}
