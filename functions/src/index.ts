/**
 * This file is part of dHealth dApps Framework shared under LGPL-3.0
 * Copyright (C) 2023-present dHealth Network, All rights reserved.
 *
 * @package     BlockRabies DTPS
 * @author      dHealth Network <devs@dhealth.foundation>
 * @license     LGPL-3.0
 */
// extenal dependencies
import {onRequest} from "firebase-functions/v2/https";
import * as express from "express";
import {Request, Response} from "express";

// internal dependencies
import {RootController} from "./controllers/RootController";
import {AnnounceController} from "./controllers/AnnounceController";
import {ServiceLog} from "./middlewares/ServiceLog";
import {AuthGuard} from "./middlewares/AuthGuard";
import {ResponseService} from "./services/ResponseService";

const initApp = async (req: Request, res: Response) => {
  // Init app
  const app = express();

  // Add service log
  app.use(ServiceLog.getInstance().createLog);

  // Authorize requests
  app.use(AuthGuard.getInstance().authorize);

  // Routes
  app.use("/", RootController.getInstance().controller);
  app.use("/announce", AnnounceController.getInstance().controller);

  // Invalid routes
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      message: `Cannot ${req.method} ${req.path}`,
      error: "Not Found",
      statusCode: 404
    });
  });

  // Add error handler
  app.use((err: object, req: Request, res: Response) => {
    ResponseService.getInstance().sendResponse(res, 500, "Server error", err);
  });

  return app(req, res);
};

// Expose Express API as a single Cloud Function:
export const dtps = onRequest({timeoutSeconds: 300}, initApp);
