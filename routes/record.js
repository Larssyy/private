const express = require("express");
const bcrypt = require("bcrypt");
const Record = require("../models/record");
const cloudflareApi = require("../utils/cloudflareApi");

const router = express.Router();
const fixedDomain = "crescent.software"; // Fixed domain

// Create a DNS record
router.post("/create", async (req, res) => {
  const { subdomain, recordType, recordValue, password } = req.body;

  try {
    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if the subdomain already exists
    const existingRecord = await Record.findOne({
      subdomain,
      domain: fixedDomain,
    });
    if (existingRecord) {
      return res.status(400).json({ error: "Subdomain already exists" });
    }

    // Save the record in the database
    const record = await Record.create({
      subdomain,
      domain: fixedDomain,
      recordType,
      recordValue,
      passwordHash,
    });

    // Create the DNS record in Cloudflare
    await cloudflareApi.post(
      `/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records`,
      {
        type: recordType,
        name: `${subdomain}.${fixedDomain}`,
        content: recordValue,
      },
    );

    res.status(201).json({ message: "Record created successfully", record });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a DNS record
router.post("/update", async (req, res) => {
  const { subdomain, recordType, recordValue, password } = req.body;

  try {
    // Find the record in the database
    const record = await Record.findOne({ subdomain, domain: fixedDomain });
    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }

    // Validate the password
    const isMatch = await bcrypt.compare(password, record.passwordHash);
    if (!isMatch) {
      return res.status(403).json({ error: "Invalid password" });
    }

    // Update the record in the database
    record.recordType = recordType;
    record.recordValue = recordValue;
    await record.save();

    // Fetch the DNS record from Cloudflare
    const dnsRecords = await cloudflareApi.get(
      `/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records`,
      {
        params: { name: `${subdomain}.${fixedDomain}` },
      },
    );

    if (!dnsRecords.data.result.length) {
      return res
        .status(404)
        .json({ error: "DNS record not found in Cloudflare" });
    }

    const dnsRecord = dnsRecords.data.result[0];

    // Update the DNS record in Cloudflare
    await cloudflareApi.put(
      `/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records/${dnsRecord.id}`,
      {
        type: recordType,
        name: `${subdomain}.${fixedDomain}`,
        content: recordValue,
      },
    );

    res.status(200).json({ message: "Record updated successfully", record });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a DNS record
router.post("/delete", async (req, res) => {
  const { subdomain, password } = req.body;

  try {
    // Find the record in the database
    const record = await Record.findOne({ subdomain, domain: fixedDomain });
    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }

    // Validate the password
    const isMatch = await bcrypt.compare(password, record.passwordHash);
    if (!isMatch) {
      return res.status(403).json({ error: "Invalid password" });
    }

    // Fetch the DNS record from Cloudflare
    const dnsRecords = await cloudflareApi.get(
      `/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records`,
      {
        params: { name: `${subdomain}.${fixedDomain}` },
      },
    );

    if (!dnsRecords.data.result.length) {
      return res
        .status(404)
        .json({ error: "DNS record not found in Cloudflare" });
    }

    const dnsRecord = dnsRecords.data.result[0];

    // Delete the DNS record in Cloudflare
    await cloudflareApi.delete(
      `/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records/${dnsRecord.id}`,
    );

    // Delete the record in the database
    await Record.deleteOne({ _id: record._id });

    res.status(200).json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
