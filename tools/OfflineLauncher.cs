using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Windows.Forms;

internal static class OfflineLauncher
{
    private const string PageFileName = "Rational-Numbers-Quick-Check.html";
    private static TcpListener listener;
    private static string pagePath;
    private static volatile bool isRunning;

    [STAThread]
    private static void Main(string[] args)
    {
        pagePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, PageFileName);
        if (!File.Exists(pagePath))
        {
            MessageBox.Show("The classroom HTML file is missing. Keep this EXE and Rational-Numbers-Quick-Check.html in the same folder.", "Rational Numbers Quick Check", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return;
        }

        var noBrowser = false;
        var requestedPort = 0;
        foreach (var arg in args)
        {
            if (arg == "--no-browser") noBrowser = true;
            if (arg.StartsWith("--port=") && !Int32.TryParse(arg.Substring(7), out requestedPort)) requestedPort = 0;
        }

        try
        {
            listener = new TcpListener(IPAddress.Loopback, requestedPort);
            listener.Start();
            isRunning = true;
            ThreadPool.QueueUserWorkItem(AcceptRequests);
            var port = ((IPEndPoint)listener.LocalEndpoint).Port;
            if (!noBrowser) Process.Start("http://127.0.0.1:" + port + "/");
            Thread.Sleep(TimeSpan.FromHours(8));
        }
        catch (Exception error)
        {
            MessageBox.Show(error.Message, "Rational Numbers Quick Check", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
        finally
        {
            isRunning = false;
            if (listener != null) listener.Stop();
        }
    }

    private static void AcceptRequests(object state)
    {
        while (isRunning)
        {
            try
            {
                var client = listener.AcceptTcpClient();
                ThreadPool.QueueUserWorkItem(Serve, client);
            }
            catch (SocketException)
            {
                if (!isRunning) return;
            }
        }
    }

    private static void Serve(object state)
    {
        using (var client = (TcpClient)state)
        using (var stream = client.GetStream())
        {
            try
            {
                var requestBuffer = new byte[4096];
                stream.Read(requestBuffer, 0, requestBuffer.Length);
                var body = File.ReadAllBytes(pagePath);
                var header = "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: " + body.Length + "\r\nCache-Control: no-store\r\nConnection: close\r\n\r\n";
                var headerBytes = Encoding.ASCII.GetBytes(header);
                stream.Write(headerBytes, 0, headerBytes.Length);
                stream.Write(body, 0, body.Length);
            }
            catch (IOException)
            {
            }
        }
    }
}
