namespace Generator.Tests.WebResourceAnalyzerTests;

/// <summary>
/// Tests for XrmQueryAttributeExtractor supporting both arrow functions and transpiled code
/// </summary>
public class XrmQueryExtractorTests : TestBase
{
    #region Retrieve Tests

    [Fact]
    public void XrmQueryExtractor_Retrieve_WithArrowFunction_ShouldExtractEntity()
    {
        // Arrange
        var code = @"
            var contact = await XrmQuery.retrieve(x => x.contacts, id).promise();
        ";

        // Act
        var results = XrmQueryExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        // Without select/filter, should be empty
        Assert.Empty(results);
    }

    [Fact]
    public void XrmQueryExtractor_Retrieve_WithTranspiledFunction_ShouldWork()
    {
        // Arrange
        var code = @"
            return [4, XrmQuery.retrieve(function (x) { return x.contacts; }, id).promise()];
        ";

        // Act
        var results = XrmQueryExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        // Without select/filter, should be empty
        Assert.Empty(results);
    }

    [Fact]
    public void XrmQueryExtractor_Retrieve_WithSelect_ShouldExtractAttributes()
    {
        // Arrange
        var code = @"
            var contact = await XrmQuery.retrieve(x => x.contacts, id)
                .select(x => [x.firstname, x.lastname, x.emailaddress1])
                .promise();
        ";

        // Act
        var results = XrmQueryExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Contains(results, r => r.AttributeName == "firstname" && r.EntityName == "contact");
        Assert.Contains(results, r => r.AttributeName == "lastname" && r.EntityName == "contact");
        Assert.Contains(results, r => r.AttributeName == "emailaddress1" && r.EntityName == "contact");
        Assert.All(results, r => Assert.Equal("Read", r.Operation));
    }

    [Fact]
    public void XrmQueryExtractor_Retrieve_WithSelectTranspiled_ShouldExtractAttributes()
    {
        // Arrange
        var code = @"
            return [4, XrmQuery.retrieve(function (x) { return x.contacts; }, id)
                .select(function (x) { return [x.firstname, x.lastname]; })
                .promise()];
        ";

        // Act
        var results = XrmQueryExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Contains(results, r => r.AttributeName == "firstname");
        Assert.Contains(results, r => r.AttributeName == "lastname");
    }

    [Fact]
    public void XrmQueryExtractor_Retrieve_WithFilter_ShouldExtractAttributes()
    {
        // Arrange
        var code = @"
            var contact = await XrmQuery.retrieve(x => x.contacts, id)
                .filter(x => Filter.equals(x.statecode, 0))
                .promise();
        ";

        // Act
        var results = XrmQueryExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Contains(results, r => r.AttributeName == "statecode" && r.Context.Contains("filter"));
    }

    [Fact]
    public void XrmQueryExtractor_Retrieve_WithFilter_Deep_ShouldExtractAttributes()
    {
        // Arrange
        var code = @"
            var contact = await XrmQuery.retrieve(x => x.contacts, id)
                .filter(x => Filter.and(Filter.equals(x.statecode, 0), Filter.equals(x.statuscode, 0)))
                .promise();
        ";

        // Act
        var results = XrmQueryExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Contains(results, r => r.AttributeName == "statecode" && r.Context.Contains("filter"));
        Assert.Contains(results, r => r.AttributeName == "statuscode" && r.Context.Contains("filter"));
    }

    [Fact]
    public void XrmQueryExtractor_Retrieve_WithFilterTranspiled_ShouldExtractAttributes()
    {
        // Arrange
        var code = @"
            return [4, XrmQuery.retrieve(function (x) { return x.accounts; }, id)
                .filter(function (x) { return Filter.equals(x.statecode, 0); })
                .promise()];
        ";

        // Act
        var results = XrmQueryExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Contains(results, r => r.AttributeName == "statecode");
        Assert.All(results, r => Assert.Equal("account", r.EntityName));
    }

    [Fact]
    public void XrmQueryExtractor_Retrieve_WithFilterTranspiled_Deep_ShouldExtractAttributes()
    {
        // Arrange
        var code = @"
            return [4, XrmQuery.retrieve(function (x) { return x.accounts; }, id)
                .filter(function (x) { return Filter.and(Filter.equals(x.statecode, 0), Filter.equals(x.statuscode, 0)); })
                .promise()];
        ";

        // Act
        var results = XrmQueryExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Contains(results, r => r.AttributeName == "statecode");
        Assert.Contains(results, r => r.AttributeName == "statuscode");
        Assert.All(results, r => Assert.Equal("account", r.EntityName));
    }

    [Fact]
    public void XrmQueryExtractor_Retrieve_WithSelectAndFilter_ShouldExtractAll()
    {
        // Arrange
        var code = @"
            var account = await XrmQuery.retrieve(x => x.accounts, id)
                .select(x => [x.name, x.revenue])
                .filter(x => Filter.equals(x.statecode, 0))
                .promise();
        ";

        // Act
        var results = XrmQueryExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Contains(results, r => r.AttributeName == "name" && r.Context.Contains("select"));
        Assert.Contains(results, r => r.AttributeName == "revenue" && r.Context.Contains("select"));
        Assert.Contains(results, r => r.AttributeName == "statecode" && r.Context.Contains("filter"));
    }

    #endregion

    #region RetrieveMultiple Tests

    [Fact]
    public void XrmQueryExtractor_RetrieveMultiple_WithArrowFunction_ShouldExtractEntity()
    {
        // Arrange
        var code = @"
            var contacts = await XrmQuery.retrieveMultiple(x => x.contacts).promise();
        ";

        // Act
        var results = XrmQueryExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Empty(results); // No attributes without select/filter
    }

    [Fact]
    public void XrmQueryExtractor_RetrieveMultiple_WithTranspiledFunction_ShouldWork()
    {
        // Arrange
        var code = @"
            return [4, XrmQuery.retrieveMultiple(function (xrm) { return xrm.contacts; }).promise()];
        ";

        // Act
        var results = XrmQueryExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Empty(results); // No attributes without select/filter
    }

    [Fact]
    public void XrmQueryExtractor_RetrieveMultiple_WithSelect_ShouldExtractAttributes()
    {
        // Arrange
        var code = @"
            var accounts = await XrmQuery.retrieveMultiple(x => x.accounts)
                .select(x => [x.name, x.accountnumber, x.revenue])
                .promise();
        ";

        // Act
        var results = XrmQueryExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Contains(results, r => r.AttributeName == "name");
        Assert.Contains(results, r => r.AttributeName == "accountnumber");
        Assert.Contains(results, r => r.AttributeName == "revenue");
        Assert.All(results, r => Assert.Equal("account", r.EntityName));
    }

    [Fact]
    public void XrmQueryExtractor_RetrieveMultiple_WithComplexFilter_ShouldExtractAllFields()
    {
        // Arrange
        var code = @"
            var accounts = await XrmQuery.retrieveMultiple(x => x.accounts)
                .filter(x => Filter.and([
                    Filter.equals(x.statecode, 0),
                    Filter.greaterThan(x.revenue, 100000)
                ]))
                .promise();
        ";

        // Act
        var results = XrmQueryExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Contains(results, r => r.AttributeName == "statecode");
        Assert.Contains(results, r => r.AttributeName == "revenue");
    }

    [Fact]
    public void XrmQueryExtractor_RetrieveMultiple_ShouldNotExtractFilterMethods()
    {
        // Arrange
        var code = @"
            var accounts = await XrmQuery.retrieveMultiple(x => x.accounts)
                .filter(x => Filter.and([
                    Filter.equals(x.name, 'Test'),
                    Filter.contains(x.telephone1, '555')
                ]))
                .promise();
        ";

        // Act
        var results = XrmQueryExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.DoesNotContain(results, r => r.AttributeName == "equals");
        Assert.DoesNotContain(results, r => r.AttributeName == "and");
        Assert.DoesNotContain(results, r => r.AttributeName == "contains");
        Assert.Contains(results, r => r.AttributeName == "name");
        Assert.Contains(results, r => r.AttributeName == "telephone1");
    }

    #endregion

    #region Create Tests

    [Fact]
    public void XrmQueryExtractor_Create_WithArrowFunction_ShouldExtractAttributes()
    {
        // Arrange
        var code = @"
            var result = await XrmQuery.create(x => x.accounts, {
                name: 'New Account',
                revenue: 100000,
                telephone1: '555-0123'
            }).promise();
        ";

        // Act
        var results = XrmQueryExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Contains(results, r => r.AttributeName == "name" && r.Operation == "Create");
        Assert.Contains(results, r => r.AttributeName == "revenue" && r.Operation == "Create");
        Assert.Contains(results, r => r.AttributeName == "telephone1" && r.Operation == "Create");
        Assert.All(results, r => Assert.Equal("account", r.EntityName));
    }

    [Fact]
    public void XrmQueryExtractor_Create_WithTranspiledFunction_ShouldExtractAttributes()
    {
        // Arrange
        var code = @"
            return [4, XrmQuery.create(function (x) { return x.contacts; }, {
                firstname: 'John',
                lastname: 'Doe'
            }).promise()];
        ";

        // Act
        var results = XrmQueryExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Contains(results, r => r.AttributeName == "firstname");
        Assert.Contains(results, r => r.AttributeName == "lastname");
        Assert.All(results, r => Assert.Equal("contact", r.EntityName));
    }

    [Fact]
    public void XrmQueryExtractor_Create_ShouldIgnoreODataProperties()
    {
        // Arrange
        var code = @"
            var result = await XrmQuery.create(x => x.accounts, {
                name: 'Test',
                'primarycontactid@odata.bind': '/contacts(guid)'
            }).promise();
        ";

        // Act
        var results = XrmQueryExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Contains(results, r => r.AttributeName == "name");
        Assert.DoesNotContain(results, r => r.AttributeName.Contains("@odata"));
    }

    #endregion

    #region Update Tests

    [Fact]
    public void XrmQueryExtractor_Update_WithArrowFunction_ShouldExtractAttributes()
    {
        // Arrange
        var code = @"
            await XrmQuery.update(x => x.accounts, id, {
                name: 'Updated Name',
                revenue: 200000
            }).promise();
        ";

        // Act
        var results = XrmQueryExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Contains(results, r => r.AttributeName == "name" && r.Operation == "Update");
        Assert.Contains(results, r => r.AttributeName == "revenue" && r.Operation == "Update");
    }

    [Fact]
    public void XrmQueryExtractor_Update_WithTranspiledFunction_ShouldExtractAttributes()
    {
        // Arrange
        var code = @"
            return [4, XrmQuery.update(function (x) { return x.contacts; }, id, {
                telephone1: '555-9999',
                emailaddress1: 'updated@example.com'
            }).promise()];
        ";

        // Act
        var results = XrmQueryExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Contains(results, r => r.AttributeName == "telephone1");
        Assert.Contains(results, r => r.AttributeName == "emailaddress1");
    }

    #endregion

    #region Delete Tests

    [Fact]
    public void XrmQueryExtractor_Delete_ShouldNotExtractAttributes()
    {
        // Arrange
        var code = @"
            await XrmQuery.deleteRecord(x => x.accounts, id).promise();
        ";

        // Act
        var results = XrmQueryExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Empty(results);
    }

    #endregion

    #region Plural to Singular Conversion Tests

    [Fact]
    public void XrmQueryExtractor_PluralConversion_RegularPlurals_ShouldConvert()
    {
        // Arrange - accounts -> account, contacts -> contact
        var code = @"
            await XrmQuery.retrieveMultiple(x => x.accounts)
                .select(x => [x.name])
                .promise();
            await XrmQuery.retrieveMultiple(x => x.contacts)
                .select(x => [x.firstname])
                .promise();
        ";

        // Act
        var results = XrmQueryExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Contains(results, r => r.EntityName == "account");
        Assert.Contains(results, r => r.EntityName == "contact");
    }

    [Fact]
    public void XrmQueryExtractor_PluralConversion_IesEnding_ShouldConvertToY()
    {
        // Arrange - opportunities -> opportunity
        var code = @"
            await XrmQuery.retrieveMultiple(x => x.opportunities)
                .select(x => [x.name])
                .promise();
        ";

        // Act
        var results = XrmQueryExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.All(results, r => Assert.Equal("opportunity", r.EntityName));
    }

    [Fact]
    public void XrmQueryExtractor_WithMetadataMapping_ShouldUseProvidedMapping()
    {
        // Arrange
        var code = @"
            await XrmQuery.retrieveMultiple(x => x.contacts)
                .select(x => [x.firstname])
                .promise();
        ";

        // Metadata mapping function
        string MapCollectionToLogical(string collectionName)
        {
            return collectionName.ToLower() == "contacts" ? "contact" : collectionName;
        }

        // Act
        var results = XrmQueryExtractor.ExtractAttributeReferences(code, MapCollectionToLogical).ToList();

        // Assert
        Assert.All(results, r => Assert.Equal("contact", r.EntityName));
    }

    #endregion

    #region Edge Cases

    [Fact]
    public void XrmQueryExtractor_WithMultipleCalls_ShouldExtractFromAll()
    {
        // Arrange
        var code = @"
            var account = await XrmQuery.retrieve(x => x.accounts, id)
                .select(x => [x.name])
                .promise();

            var contacts = await XrmQuery.retrieveMultiple(x => x.contacts)
                .select(x => [x.firstname])
                .promise();

            await XrmQuery.create(x => x.opportunities, { name: 'Deal' }).promise();
        ";

        // Act
        var results = XrmQueryExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Contains(results, r => r.EntityName == "account" && r.AttributeName == "name");
        Assert.Contains(results, r => r.EntityName == "contact" && r.AttributeName == "firstname");
        Assert.Contains(results, r => r.EntityName == "opportunity" && r.AttributeName == "name");
    }

    [Fact]
    public void XrmQueryExtractor_WithEmptyString_ShouldReturnEmpty()
    {
        // Arrange
        var code = "";

        // Act
        var results = XrmQueryExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Empty(results);
    }

    [Fact]
    public void XrmQueryExtractor_WithNoXrmQueryCalls_ShouldReturnEmpty()
    {
        // Arrange
        var code = @"
            console.log('Hello World');
            var data = { name: 'test' };
        ";

        // Act
        var results = XrmQueryExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Empty(results);
    }

    [Fact]
    public void XrmQueryExtractor_WithDifferentParameterNames_ShouldWork()
    {
        // Arrange
        var code = @"
            var accounts = await XrmQuery.retrieveMultiple(entity => entity.accounts)
                .select(record => [record.name, record.revenue])
                .promise();
        ";

        // Act
        var results = XrmQueryExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Contains(results, r => r.AttributeName == "name");
        Assert.Contains(results, r => r.AttributeName == "revenue");
    }

    [Fact]
    public void XrmQueryExtractor_WithMultilineChaining_ShouldExtractAll()
    {
        // Arrange
        var code = @"
            var accounts = await XrmQuery
                .retrieveMultiple(x => x.accounts)
                .select(x => [
                    x.name,
                    x.revenue,
                    x.telephone1
                ])
                .filter(x => Filter.equals(x.statecode, 0))
                .promise();
        ";

        // Act
        var results = XrmQueryExtractor.ExtractAttributeReferences(code).ToList();

        // Assert
        Assert.Contains(results, r => r.AttributeName == "name");
        Assert.Contains(results, r => r.AttributeName == "revenue");
        Assert.Contains(results, r => r.AttributeName == "telephone1");
        Assert.Contains(results, r => r.AttributeName == "statecode");
    }

    #endregion
}
