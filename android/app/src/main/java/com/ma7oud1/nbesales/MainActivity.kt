package com.ma7oud1.nbesales

import android.app.Activity
import android.content.ContentValues
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.util.Base64
import android.view.View
import android.webkit.CookieManager
import android.webkit.DownloadListener
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast

class MainActivity : Activity() {
    private lateinit var web: WebView
    private val home = "https://ma7oud1.github.io/-nbe-sales/"
    private val trustedHost = "ma7oud1.github.io"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = Color.rgb(0, 77, 51)
        window.navigationBarColor = Color.rgb(0, 63, 42)

        web = WebView(this)
        web.setBackgroundColor(Color.rgb(245, 247, 245))
        web.overScrollMode = View.OVER_SCROLL_NEVER
        web.isVerticalScrollBarEnabled = false
        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = true
        web.settings.databaseEnabled = true
        web.settings.mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_NEVER_ALLOW
        web.settings.allowFileAccess = false
        web.settings.allowContentAccess = false
        CookieManager.getInstance().setAcceptCookie(true)
        web.addJavascriptInterface(DownloadBridge(), "NbeAndroid")

        web.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: android.webkit.WebResourceRequest): Boolean {
                val uri = request.url
                if (uri.scheme == "https" && uri.host == trustedHost) return false
                if (uri.scheme == "https" || uri.scheme == "http" || uri.scheme == "tel" || uri.scheme == "mailto") {
                    return try { startActivity(android.content.Intent(android.content.Intent.ACTION_VIEW, uri)); true }
                    catch (_: Exception) { true }
                }
                return true
            }

            override fun onPageFinished(view: WebView, url: String) {
                super.onPageFinished(view, url)
                val js = "(function(){if(window.__nbeDl)return;window.__nbeDl=true;document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[download]');if(!a)return;var u=a.href||'';if(!u.startsWith('blob:')&&!u.startsWith('data:'))return;e.preventDefault();fetch(u).then(r=>r.blob()).then(b=>{var f=new FileReader();f.onloadend=()=>NbeAndroid.save(String(f.result),a.download||'NBE-Sales-file');f.readAsDataURL(b);});},true);})();"
                view.evaluateJavascript(js, null)
            }
        }
        web.webChromeClient = WebChromeClient()
        web.setDownloadListener(DownloadListener { url, _, _, _, _ ->
            Toast.makeText(this, "يتم تجهيز تنزيل الملف", Toast.LENGTH_SHORT).show()
            try {
                val req = android.app.DownloadManager.Request(Uri.parse(url))
                req.setNotificationVisibility(android.app.DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                req.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, "NBE-Sales-" + System.currentTimeMillis())
                (getSystemService(DOWNLOAD_SERVICE) as android.app.DownloadManager).enqueue(req)
            } catch (_: Exception) {
                Toast.makeText(this, "تعذر تنزيل الملف", Toast.LENGTH_SHORT).show()
            }
        })

        setContentView(web)
        if (savedInstanceState == null) web.loadUrl(home) else web.restoreState(savedInstanceState)
    }

    inner class DownloadBridge {
        @JavascriptInterface
        fun save(data: String, name: String) {
            try {
                val comma = data.indexOf(',')
                if (comma < 0) throw IllegalArgumentException()
                val header = data.substring(0, comma)
                val mime = Regex("data:([^;]+)").find(header)?.groupValues?.get(1) ?: "application/octet-stream"
                val bytes = Base64.decode(data.substring(comma + 1), Base64.DEFAULT)
                val safe = name.substringAfterLast('/').replace(Regex("[^A-Za-z0-9._-]"), "_").take(80).ifBlank { "NBE-Sales-file" }
                val ext = when (mime) { "image/png" -> ".png"; "image/jpeg" -> ".jpg"; "application/json" -> ".json"; else -> ".bin" }
                val fileName = if (safe.contains('.')) safe else safe + ext
                val values = ContentValues().apply {
                    put(MediaStore.Downloads.DISPLAY_NAME, fileName)
                    put(MediaStore.Downloads.MIME_TYPE, mime)
                    put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
                }
                val uri = contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values) ?: throw IllegalStateException()
                contentResolver.openOutputStream(uri)?.use { it.write(bytes) }
                runOnUiThread { Toast.makeText(this@MainActivity, "تم حفظ الملف في مجلد التنزيلات", Toast.LENGTH_LONG).show() }
            } catch (_: Exception) {
                runOnUiThread { Toast.makeText(this@MainActivity, "تعذر حفظ الملف", Toast.LENGTH_LONG).show() }
            }
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        web.saveState(outState)
        super.onSaveInstanceState(outState)
    }

    @Deprecated("Compatibility with older Android versions")
    override fun onBackPressed() {
        if (::web.isInitialized && web.canGoBack()) web.goBack() else super.onBackPressed()
    }
}
