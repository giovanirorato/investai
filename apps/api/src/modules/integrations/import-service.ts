const statusCompanies =
  await loadStatusInvest();

for (const company of statusCompanies) {

  const brapi =
    await getBrapiData(
      company.ticker
    );

  const fundamentus =
    await getFundamentusData(
      company.ticker
    );

  const merged =
    mergeCompanyData(
      brapi,
      company,
      fundamentus
    );

  await saveCompany(
    merged
  );
}