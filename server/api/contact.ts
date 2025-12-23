import { defineEventHandler, readBody, createError } from 'h3'
import { Resend } from 'resend'

export default defineEventHandler(async (event) => {
  // Only allow POST requests
  if (event.node.req.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  try {
    const body = await readBody(event)
    const { name, email, telephone, comment } = body

    // Validate required fields
    if (!name || !email || !telephone) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: name, email, and telephone are required'
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email address'
      })
    }

    // Get email service configuration from environment variables
    const apiKey = process.env.EMAIL_API_KEY || process.env.RESEND_API_KEY
    const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev'
    const toEmail = process.env.EMAIL_TO

    if (!apiKey) {
      console.error('EMAIL_API_KEY or RESEND_API_KEY environment variable is not set')
      throw createError({
        statusCode: 500,
        statusMessage: 'Email service not configured'
      })
    }

    if (!toEmail) {
      console.error('EMAIL_TO environment variable is not set')
      throw createError({
        statusCode: 500,
        statusMessage: 'Recipient email not configured'
      })
    }

    // Prepare email content
    const subject = `New Contact Form Submission from ${name}`
    const htmlContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Telephone:</strong> ${telephone}</p>
      ${comment ? `<p><strong>Comment:</strong><br>${comment.replace(/\n/g, '<br>')}</p>` : ''}
      <hr>
      <p><small>Submitted on ${new Date().toLocaleString()}</small></p>
    `
    const textContent = `
New Contact Form Submission

Name: ${name}
Email: ${email}
Telephone: ${telephone}
${comment ? `Comment: ${comment}` : ''}

Submitted on ${new Date().toLocaleString()}
    `

    // Send email using Resend
    const resend = new Resend(apiKey)
    
    console.log('[Contact Form] Attempting to send email:', {
      from: fromEmail,
      to: toEmail,
      subject,
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0
    })
    
    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject,
      html: htmlContent,
      text: textContent
    })

    console.log('[Contact Form] Email sent successfully:', emailResponse)

    return {
      success: true,
      message: 'Contact form submitted successfully',
      data: emailResponse
    }
  } catch (error: any) {
    console.error('[Contact Form] Error details:', {
      message: error?.message,
      name: error?.name,
      statusCode: error?.statusCode,
      stack: error?.stack,
      response: error?.response
    })
    
    // If it's already a createError, re-throw it
    if (error.statusCode) {
      throw error
    }

    // Log Resend-specific errors
    if (error?.response) {
      console.error('[Contact Form] Resend API error response:', error.response)
    }

    // Otherwise, create a generic error
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to send contact form'
    })
  }
})

